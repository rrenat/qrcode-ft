# qrcode-ft

A React component to generate [QR code](http://en.wikipedia.org/wiki/QR_code) with logo.
Inspired by [cssivision/qrcode-react](https://github.com/cssivision/qrcode-react).

Square, circle and squircle position markers available.

## Installation

```sh
npm install qrcode-ft
```

## Usage

```js
var React = require('react');
var ReactDOM = require('react-dom');
var QRCode = require('qrcode-ft');

ReactDOM.render(
  <QRCode value="http://facebook.github.io/react/" />,
  mountNode
);
```

## Available Props

prop         | type                                    | default value
-------------|-----------------------------------------|-----------------------------------
`value`      | `string`                                | `http://facebook.github.io/react/`
`size`       | `number`                                | `128`
`displaySize`| `number`                                | `128`
`mode`       | `string` ("square","circle","squircle") | `square`
`bgColor`    | `string` (CSS color)                    | `"#FFFFFF"`
`fgColor`    | `string` (CSS color)                    | `"#000000"`
`borderPart` | `string` (float)                        | `0.1`
`showCenter` | `bool`                                  | `false`
`logo`       | `string` (URL / PATH)                   |
`logoWidth`  | `number`                                | `size * 0.18`
`logoHeight` | `number`                                | Proportional scaling to `logoWidth`

<img src="qrcode.png" height="256" width="256">
