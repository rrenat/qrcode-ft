var QRCode = require('../lib/index.js');
var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
    getInitialState: function() {
        return {
            text: ''
        }
    },

    _onChange: function(event) {
        this.setState({text: event.target.value});
    },

    render: function() {
        return (
            <div className='application'>
                <input type='text' className='qrcode-input'
                    onChange={this._onChange}
                    value={this.state.text}
                    placeholder="input string"/>
                <QRCode className='qrcode' value={this.state.text}
                    size={1000}
					displaySize={360}
					mode='squircle'
                    fgColor='black'
                    bgColor='white' />
            </div>
        );
    }
});

var sty

ReactDOM.render(
    <App/>,
    document.getElementById('demo')
);
