# qrcode-ft

A React component to generate [QRCode](http://en.wikipedia.org/wiki/QR_code) with logo.
Inspired by [cssivision/qrcode-react](https://github.com/cssivision/qrcode-react).

## Installation

```sh
npm install qrcode-react
```

## Usage

```js
var React = require('react');
var ReactDOM = require('react-dom');
var QRCode = require('qrcode-react');

ReactDOM.render(
  <QRCode value="http://facebook.github.io/react/" />,
  mountNode
);
```

## Available Props

prop         | type                 | default value
-------------|----------------------|-----------------------------------
`value`      | `string`             | `http://facebook.github.io/react/`
`size`       | `number`             | `128`
`bgColor`    | `string` (CSS color) | `"#FFFFFF"`
`fgColor`    | `string` (CSS color) | `"#000000"`
`logo`       | `string` (URL / PATH)|
`logoWidth`  | `number`             | `size * 0.2`
`logoHeight` | `number`             | Proportional scaling to `logoWidth`

<img src="qrcode.png" height="256" width="256">
