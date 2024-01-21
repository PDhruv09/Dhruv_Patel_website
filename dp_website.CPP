// main.cpp

#include <cpprest/http_listener.h>
#include <cpprest/json.h>

using namespace web;
using namespace http;
using namespace http::experimental::listener;

class DhruvServer
{
public:
    DhruvServer(utility::string_t url)
        : listener_(url)
    {
        listener_.support(methods::GET, std::bind(&DhruvServer::handle_get, this, std::placeholders::_1));
    }

    void handle_get(http_request request)
    {
        utility::string_t path = request.relative_uri().path();

        if (path == U("/social"))
        {
            // Handle social media page
            web::json::value response = web::json::value::object();
            response[U("message")] = web::json::value::string(U("Social Media Handles"));
            request.reply(status_codes::OK, response);
        }
        else if (path == U("/resume"))
        {
            // Handle resume page
            web::json::value response = web::json::value::object();
            response[U("message")] = web::json::value::string(U("Resume Page"));
            request.reply(status_codes::OK, response);
        }
        else if (path == U("/projects"))
        {
            // Handle projects page
            web::json::value response = web::json::value::object();
            response[U("message")] = web::json::value::string(U("Projects Page"));
            request.reply(status_codes::OK, response);
        }
        else if (path == U("/github"))
        {
            // Handle GitHub page
            web::json::value response = web::json::value::object();
            response[U("message")] = web::json::value::string(U("GitHub Page"));
            request.reply(status_codes::OK, response);
        }
        else
        {
            // Handle home page or unknown path
            web::json::value response = web::json::value::object();
            response[U("message")] = web::json::value::string(U("Home Page"));
            request.reply(status_codes::OK, response);
        }
    }

    pplx::task<void> open() { return listener_.open(); }

    pplx::task<void> close() { return listener_.close(); }

private:
    http_listener listener_;
};

int main()
{
    utility::string_t url = U("http://localhost:8080");
    DhruvServer server(url);

    try
    {
        server.open().wait();
        std::wcout << U("Server listening at: ") << url << std::endl;

        while (true);
    }
    catch (std::exception const &e)
    {
        std::wcerr << e.what() << std::endl;
    }

    return 0;
}
