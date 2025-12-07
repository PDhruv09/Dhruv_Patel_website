/* ==========================================
   BLOG INDEX - ENHANCED VERSION
   Loads posts, filters by search/tag, updates UI
   ========================================== */

console.log("📝 Blog page loading...");

(function () {
  "use strict";

  // ---------- State ----------
  const state = {
    posts: [],
    activeTag: null,
    query: "",
    initializedFromURL: false,
  };

  // ---------- DOM ----------
  const els = {
    grid: document.getElementById("grid"),
    empty: document.getElementById("empty-state"),
    tags: document.getElementById("tags"),
    clearTag: document.getElementById("clear-tag"),
    search: document.getElementById("search-input"),
    clearSearch: document.getElementById("clear-search"),
  };

  // Guard if index.html didn't include expected nodes
  if (!els.grid || !els.tags || !els.search) {
    console.warn("[blogs.js] Missing required DOM nodes.");
    return;
  }

  // ---------- Utils ----------
  const fmt = {
    // Basic text escape for safety in string templates
    esc(s) {
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },
    
    // Debounce helper for input events
    debounce(fn, ms = 160) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
      };
    },
    
    // Update query params without reloading
    setQueryParam(key, val) {
      const url = new URL(window.location.href);
      if (val && String(val).length) {
        url.searchParams.set(key, val);
      } else {
        url.searchParams.delete(key);
      }
      history.replaceState(null, "", url.toString());
    },
  };

  function setAriaBusy(node, busy) {
    node.setAttribute("aria-busy", busy ? "true" : "false");
  }

  // ---------- Loading & Error States ----------
  function showLoadingState() {
    els.grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(74, 124, 138, 0.2); border-top-color: #4a7c8a; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 1rem; color: var(--tertiary-ink);">Loading posts...</p>
      </div>
    `;
  }

  function showErrorState(message) {
    els.grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="font-size: 1.2rem; color: var(--accent-red);">⚠️ Unable to load blog posts</p>
        <p style="margin-top: 1rem; color: var(--tertiary-ink);">${fmt.esc(message)}</p>
      </div>
    `;
    els.empty.hidden = true;
  }

  // ---------- Data loading ----------
  async function loadPosts() {
    try {
      showLoadingState();
      
      const res = await fetch("assets/json/blogs.json", { 
        cache: "no-store",
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error("blogs.json must be an array");
      }
      
      state.posts = data;
      console.log(`✅ Loaded ${data.length} blog posts`);
      
    } catch (err) {
      console.error("[blogs.js] Failed to load blogs.json:", err);
      showErrorState(err.message);
      state.posts = [];
    }
  }

  // ---------- Filters & Matching ----------
  function matchesSearch(post) {
    if (!state.query) return true;
    const q = state.query.toLowerCase();
    const fields = [
      post.title || "",
      post.summary || "",
      // Intentionally NOT searching tags per spec
    ];
    return fields.some((f) => f.toLowerCase().includes(q));
  }

  function matchesTag(post) {
    if (!state.activeTag) return true;
    return Array.isArray(post.tags) && post.tags.includes(state.activeTag);
  }

  function filteredPosts() {
    return state.posts
      .filter(matchesSearch)
      .filter(matchesTag)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function computeTagCounts() {
    const counts = new Map();
    state.posts.forEach((p) =>
      (p.tags || []).forEach((t) => counts.set(t, (counts.get(t) || 0) + 1))
    );
    return Array.from(counts.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  }

  // ---------- Rendering ----------
  function renderTags() {
    const counts = computeTagCounts();
    els.tags.innerHTML = "";

    if (counts.length === 0) {
      els.tags.innerHTML = '<p style="color: var(--tertiary-ink); font-style: italic;">No tags available</p>';
      return;
    }

    counts.forEach(([tag, count]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag" + (state.activeTag === tag ? " active" : "");
      btn.setAttribute("data-tag", tag);
      btn.setAttribute("aria-pressed", state.activeTag === tag ? "true" : "false");
      btn.title = `Filter by ${tag} (${count} post${count > 1 ? 's' : ''})`;
      btn.innerHTML = `
        <span class="label">${fmt.esc(tag)}</span>
        <span class="count">${count}</span>
      `;

      btn.addEventListener("click", () => {
        // Clicking a tag clears the search per spec
        state.query = "";
        els.search.value = "";
        els.clearSearch.classList.remove("show");
        fmt.setQueryParam("q", "");

        state.activeTag = state.activeTag === tag ? null : tag;
        fmt.setQueryParam("tag", state.activeTag || "");
        renderAll();
        
        // Announce to screen readers
        announceToScreenReader(
          state.activeTag 
            ? `Filtered to ${tag} posts` 
            : "Showing all posts"
        );
        
        // Move focus to the grid for quicker navigation
        els.grid.focus({ preventScroll: true });
      });

      els.tags.appendChild(btn);
    });

    els.clearTag.hidden = state.activeTag === null;
    els.clearTag.setAttribute("aria-hidden", state.activeTag === null ? "true" : "false");
  }

  function renderGrid() {
    const data = filteredPosts();
    els.grid.innerHTML = "";

    if (!data.length) {
      els.empty.hidden = false;
      els.grid.setAttribute("aria-label", "No posts match your filter");
      announceToScreenReader("No posts match your filter");
      return;
    }

    els.empty.hidden = true;
    els.grid.setAttribute("aria-label", `Showing ${data.length} post${data.length > 1 ? 's' : ''}`);

    const frag = document.createDocumentFragment();

    data.forEach((p, index) => {
      const card = document.createElement("article");
      card.className = "card";
      card.style.animationDelay = `${index * 0.05}s`;
      card.setAttribute("role", "listitem");

      const thumb =
        p.thumbnail && typeof p.thumbnail === "string"
          ? `<img class="card-thumb" src="${fmt.esc(p.thumbnail)}" alt="${fmt.esc(
              p.title || "Post thumbnail"
            )}" loading="lazy">`
          : `<div class="card-thumb" style="background: var(--bg-light-gray);" aria-hidden="true"></div>`;

      const tags =
        (p.tags || [])
          .map((t) => `<span class="pill">${fmt.esc(t)}</span>`)
          .join("") || "";

      const meta = [p.date, p.readingTime].filter(Boolean).join(" • ");

      card.innerHTML = `
        <a href="${fmt.esc(p.url || "#")}" aria-label="Read: ${fmt.esc(p.title || "Untitled")}">
          ${thumb}
          <div class="card-body">
            <h3 class="card-title">${fmt.esc(p.title || "Untitled")}</h3>
            ${meta ? `<div class="card-meta">${fmt.esc(meta)}</div>` : ""}
            ${
              p.summary
                ? `<p class="card-summary">${fmt.esc(p.summary)}</p>`
                : ""
            }
            ${tags ? `<div class="card-tags">${tags}</div>` : ""}
          </div>
        </a>
      `;

      frag.appendChild(card);
    });

    els.grid.appendChild(frag);
    announceToScreenReader(`Showing ${data.length} post${data.length > 1 ? 's' : ''}`);
  }

  function renderAll() {
    setAriaBusy(els.grid, true);
    renderTags();
    renderGrid();
    setAriaBusy(els.grid, false);
    
    // Clear button visibility
    els.clearSearch.classList.toggle("show", state.query.length > 0);
  }

  // ---------- Events ----------
  const onSearchInput = fmt.debounce(() => {
    const val = els.search.value.trim();
    state.query = val;

    // Typing in search clears active tag (per spec)
    if (val.length > 0) {
      state.activeTag = null;
      fmt.setQueryParam("tag", "");
    }
    fmt.setQueryParam("q", val);

    renderAll();
  }, 160);

  els.search.addEventListener("input", onSearchInput);

  // Handle Enter key on search
  els.search.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchInput();
    }
  });

  els.clearSearch?.addEventListener("click", () => {
    els.search.value = "";
    els.search.focus();
    state.query = "";
    fmt.setQueryParam("q", "");
    renderAll();
    announceToScreenReader("Search cleared");
  });

  els.clearTag?.addEventListener("click", () => {
    state.activeTag = null;
    fmt.setQueryParam("tag", "");
    renderAll();
    announceToScreenReader("Tag filter cleared");
  });

  // ---------- Init from URL ----------
  function initFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tag = params.get("tag");
    const q = params.get("q");

    if (tag) {
      state.activeTag = tag;
    }
    if (q) {
      state.query = q;
      els.search.value = q;
      els.clearSearch.classList.add("show");
    }
    state.initializedFromURL = Boolean(tag || q);
  }

  // ---------- Screen Reader Announcements ----------
  function announceToScreenReader(message) {
    let announcer = document.getElementById("blog-announcer");
    
    if (!announcer) {
      announcer = document.createElement("div");
      announcer.id = "blog-announcer";
      announcer.setAttribute("role", "status");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      document.body.appendChild(announcer);
    }
    
    announcer.textContent = message;
  }

  // ---------- Boot ----------
  (async function boot() {
    console.log("🎨 Initializing blog page...");
    
    // Make grid focusable for skip-to-content UX
    els.grid.setAttribute("tabindex", "-1");
    els.grid.setAttribute("role", "list");
    els.grid.setAttribute("aria-live", "polite");
    els.grid.setAttribute("aria-busy", "true");

    initFromURL();
    await loadPosts();
    
    if (state.posts.length > 0) {
      renderAll();
      console.log("✨ Blog page ready!");
    }
  })();

  // Add CSS for loading spinner
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
})();
