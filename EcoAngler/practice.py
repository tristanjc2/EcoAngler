from flask import Flask, render_template, send_from_directory

app = Flask(__name__, static_url_path='/static')

@app.route('/')
def index():
    return render_template('/index.html')

@app.route('/about')
def about():
    return render_template('/about.html')

@app.route('/locator')
def locator():
    return render_template('/locator.html')

@app.route('/contact')
def contact():
    return render_template('/contact.html')

@app.route('/location')
def location():
    return render_template('/location.html')

# Serve JavaScript files with the correct MIME type for modules
@app.route('/static/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path), 200, {'Content-Type': 'application/javascript'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port='5000',debug=True)