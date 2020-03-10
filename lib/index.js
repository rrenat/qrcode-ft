'use strict'

var React = require('react');
var PropTypes = require('prop-types');
var ReactDOM = require('react-dom');
var qr = require('qr.js');

function getBackingStorePixelRatio(ctx) {
    return (
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1
    );
}

var getDOMNode;
if (/^0\.14/.test(React.version)) {
    getDOMNode = function(ref) {
        return ref;
    }
} else {
    getDOMNode = function(ref) {
        return ReactDOM.findDOMNode(ref);
    }
}

class QRCode extends React.Component {
    shouldComponentUpdate(nextProps) {
        var that = this;
        return Object.keys(QRCode.propTypes).some(function(k) {
            return that.props[k] !== nextProps[k];
        });
    }

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    utf16to8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    update() {
        var value = this.utf16to8(this.props.value);
        var qrcode = qr(value);
        var canvas = getDOMNode(this.refs.canvas);
		
		var borderPart = this.props.borderPart || 0;
		var iconPart = this.props.iconPart || 0.115;
		var mode = this.props.mode !== 'square' && this.props.mode !== 'circle'	&& this.props.mode !== 'squircle'
			? 'square'
			: this.props.mode;
		
		var ctx = canvas.getContext('2d');
        var cells = qrcode.modules;

        var tileW = this.props.size * (1- 2 * borderPart) / cells.length;
        var tileH = this.props.size * (1- 2 * borderPart) / cells.length;
        var scale = (window.devicePixelRatio || 1) / getBackingStorePixelRatio(ctx);
        canvas.height = canvas.width = this.props.size * scale;
        ctx.scale(scale, scale);
		
		var size = this.props.size * (1- 2 * borderPart);
		var fullSize = this.props.size;
		var fgColor = this.props.fgColor;
		var bgColor = this.props.bgColor;
		
		var squircle = {
			n: 4,
			radius: 10,
			x: 5,
			y: 5,
			color: fgColor,
			derivation: function(x) {
				return Math.pow(
					(Math.pow(this.radius, this.n) - Math.pow(Math.abs(x), this.n)),
					1 / (this.n)
				);
			},
			draw: function() {
				ctx.beginPath();
				ctx.lineWidth = 1;
				ctx.strokeStyle = this.color;
				for (var i = -this.radius * 2; i <= this.radius * 2; i++) {
					var x = i + this.x,
					y = this.derivation(i) + this.y;
					ctx.lineTo(x, y);
				}
				for (i = this.radius * 2; i >= -this.radius * 2; i--) {
					x = i + this.x;
					y = -this.derivation(i) + this.y;
					ctx.lineTo(x, y);
				}
				ctx.closePath()
				ctx.stroke();
				ctx.fillStyle = this.color;
				ctx.fill();
			}
		}
		
		var squircleBg = Object.assign({}, squircle);
		squircleBg.n = 22;
		squircleBg.color = bgColor;
		squircleBg.radius = canvas.width / 2;
		squircleBg.x = canvas.width / 2;
		squircleBg.y = canvas.width / 2;
		
		squircleBg.draw();
		
		var shift = 0;
		if (cells[0]) {
			for (var x=0; x<cells[0].length;x++) {
				if (cells[0][x]) {
					continue;
				}
				shift = x;
				break;
			}
		}
		
		if (mode !== 'square' && cells) {
			for (var y=0;y<cells.length;y++) {
				if (!cells[y]) {
					continue;
				}
				
				for (var x=0; x<cells[y].length;x++){
					if (y<=shift && x<=shift) {
						cells[y][x] = false;
					}
					if (y>=cells.length-shift && x<=shift) {
						cells[y][x] = false;
					}
					if (y<=shift && x>=cells[y].length-shift) {
						cells[y][x] = false;
					}
				}
			}
		}

        cells.forEach(function(row, rdx) {
            row.forEach(function(cell, cdx) {
				var rectW = (Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW));
                var rectH = (Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH));
				var rectX = Math.round(cdx * tileW) + this.props.size * borderPart;
				var rectY = Math.round(rdx * tileH) + this.props.size * borderPart;
				var cornerRadius = 0;
                ctx.fillStyle = cell ? this.props.fgColor : this.props.bgColor;				
				ctx.fillRect(rectX, rectY, rectW, rectH);
            }, this);
        }, this);
		
		shift++;
		
		if (mode === 'squircle') {
			// Top Left corner
			var squircleTLout = Object.assign({}, squircle);
			squircleTLout.n = 4;
			squircleTLout.color = fgColor;
			squircleTLout.radius = shift/2*tileW-tileW/2;
			squircleTLout.x = shift/2*tileW - tileW / 2 + fullSize * borderPart;
			squircleTLout.y = shift/2*tileH - tileH/2 + fullSize * borderPart;
			
			var squircleTLin = Object.assign({}, squircle);
			squircleTLin.n = 4;
			squircleTLin.color = bgColor;
			squircleTLin.radius = shift/2*tileW-tileW/2-tileW;
			squircleTLin.x = shift/2*tileW - tileW/2 + fullSize * borderPart;
			squircleTLin.y = shift/2*tileH - tileH/2 + fullSize * borderPart;
			
			var squircleTLcenter = Object.assign({}, squircle);
			squircleTLcenter.n = 4;
			squircleTLcenter.color = fgColor;
			squircleTLcenter.radius = tileW*1.5;
			squircleTLcenter.x = shift/2*tileW - tileW/2 + fullSize * borderPart;
			squircleTLcenter.y = shift/2*tileH - tileH/2 + fullSize * borderPart;
			
			squircleTLout.draw();
			squircleTLin.draw();
			squircleTLcenter.draw();
			
			// Top Right corner
			var squircleTRout = Object.assign({}, squircleTLout);
			squircleTRout.x = (cells[0].length-shift/2)*tileW + tileW/2 + fullSize * borderPart;
			squircleTRout.y = shift/2*tileH - tileH/2 + fullSize * borderPart;
			
			var squircleTRin = Object.assign({}, squircleTLin);
			squircleTRin.x = (cells[0].length-shift/2)*tileW + tileW/2 + fullSize * borderPart;
			squircleTRin.y = shift/2*tileH - tileH/2 + fullSize * borderPart;
			
			var squircleTRcenter = Object.assign({}, squircleTLcenter);
			squircleTRcenter.x = (cells[0].length-shift/2)*tileW + tileW/2 + fullSize * borderPart;
			squircleTRcenter.y = shift/2*tileH - tileH/2 + fullSize * borderPart;
			
			squircleTRout.draw();
			squircleTRin.draw();
			squircleTRcenter.draw();
			
			// Bottom Left corner
			
			var squircleBLout = Object.assign({}, squircleTLout);
			squircleBLout.x = shift/2*tileW - tileW/2 + fullSize * borderPart;
			squircleBLout.y = (cells.length-shift/2)*tileH + tileH/2 + fullSize * borderPart;
			
			var squircleBLin = Object.assign({}, squircleTLin);
			squircleBLin.x = shift/2*tileW - tileW/2 + fullSize * borderPart;
			squircleBLin.y = (cells.length-shift/2)*tileH + tileH/2 + fullSize * borderPart;
			
			var squircleBLcenter = Object.assign({}, squircleTLcenter);
			squircleBLcenter.x = shift/2*tileW - tileW/2 + fullSize * borderPart;
			squircleBLcenter.y = (cells.length-shift/2)*tileH + tileH/2 + fullSize * borderPart;
			
			squircleBLout.draw();
			squircleBLin.draw();
			squircleBLcenter.draw();
		}
		
		if (mode === 'circle') {
			ctx.strokeStyle = this.props.fgColor;
			ctx.fillStyle = this.props.fgColor;
			ctx.lineWidth = tileW;
			
			//TL
			ctx.beginPath();
			ctx.arc(shift/2*tileW - tileW/2 + fullSize * borderPart, shift/2*tileH - tileH/2 + fullSize * borderPart, shift/2*tileW-tileW, 0, 2 * Math.PI);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(shift/2*tileW - tileW/2 + fullSize * borderPart, shift/2*tileH - tileH/2 + fullSize * borderPart, tileW, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			
			// TR
			ctx.beginPath();
			ctx.arc((cells[0].length-shift/2)*tileW + tileW/2 + fullSize * borderPart, shift/2*tileH - tileH/2 + fullSize * borderPart, shift/2*tileW-tileW, 0, 2 * Math.PI);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc((cells[0].length-shift/2)*tileW + tileW/2 + fullSize * borderPart, shift/2*tileH - tileH/2 + fullSize * borderPart, tileW, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			
			// BL
			ctx.beginPath();
			ctx.arc(shift/2*tileW - tileW/2 + fullSize * borderPart, (cells.length-shift/2)*tileH + tileH/2 + fullSize * borderPart, shift/2*tileW-tileW, 0, 2 * Math.PI);
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(shift/2*tileW - tileW/2 + fullSize * borderPart, (cells.length-shift/2)*tileH + tileH/2 + fullSize * borderPart, tileW, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}
		
		if ( this.props.showCenter )
		{
			var squircle1 = Object.assign({}, squircle);
			squircle1.n = 5;
			squircle1.color = fgColor;
			squircle1.radius = size * iconPart + tileW;
			squircle1.x = size / 2 + fullSize * borderPart;
			squircle1.y = size / 2 + fullSize * borderPart;
		
			var squircle2 = Object.assign({}, squircle);
			squircle2.n = 5;
			squircle2.color = bgColor;
			squircle2.radius = size * iconPart;
			squircle2.x = size / 2 + fullSize * borderPart;
			squircle2.y = size / 2 + fullSize * borderPart;
		
			squircle1.draw();
			squircle2.draw();
		}
		
        if (this.props.logo) {
            var self = this
			var fullSize = this.props.size;
            var size = this.props.size * (1 - 2 * borderPart);
            var image = document.createElement('img');
            image.src = this.props.logo;
            image.onload = function() {
                var dwidth = self.props.logoWidth || size * 0.18;
                var dheight = self.props.logoHeight || image.height / image.width * dwidth;
                var dx = (size - dwidth) / 2 + fullSize * borderPart;
                var dy = (size - dheight) / 2 + fullSize * borderPart;
                image.width = dwidth;
                image.height = dheight;
                ctx.drawImage(image, dx, dy, dwidth, dheight);
            }
        }
    }

    render() {
        return React.createElement('canvas', {
            style: { height: this.props.displaySize, width: this.props.displaySize },
            height: this.props.displaySize,
            width: this.props.displaySize,
            ref: 'canvas'
        });
    }
}

QRCode.propTypes = {
    value: PropTypes.string.isRequired,
    size: PropTypes.number,
	displaySize: PropTypes.number,
	borderPart: PropTypes.number,
    bgColor: PropTypes.string,
    fgColor: PropTypes.string,
	mode: PropTypes.string,
	showCenter: PropTypes.bool,
    logo: PropTypes.string,
    logoWidth: PropTypes.number,
    logoHeight: PropTypes.number
};

QRCode.defaultProps = {
    size: 128,
	displaySize: 128,
	borderPart: 0.1,
    bgColor: '#FFFFFF',
    fgColor: '#000000',
	mode: 'square',
	showCenter: false,
    value: 'http://facebook.github.io/react/'
};

module.exports = QRCode;
