from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/social', methods=['GET'])
def social():
    return jsonify({'message': 'Social Media Handles'})

@app.route('/resume', methods=['GET'])
def resume():
    return jsonify({'message': 'Resume Page'})

@app.route('/projects', methods=['GET'])
def projects():
    return jsonify({'message': 'Projects Page'})

@app.route('/github', methods=['GET'])
def github():
    return jsonify({'message': 'GitHub Page'})

@app.route('/', methods=['GET'])
def home():
    with open('dp_website.html', 'r') as file:
        html_content = file.read()
    return html_content, 200, {'Content-Type': 'text/html'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
