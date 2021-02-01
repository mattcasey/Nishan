---
slug: /
---

## Installing

1. Open up your terminal and navigate to the directory you wanna install the package at.
2. Type `yarn add @nishans/notion-formula` in the terminal.

## Usage

```js
const {generateFormulaASTFromObject, generateFormulaASTFromArray} = require("@nishans/notion-formula");

// Generate notion formula from simple object representation
console.log(JSON.stringify(generateFormulaASTFromObject({function: "abs", args: [1]}), null, 2));

// Generate notion formula from simple array representation
console.log(JSON.stringify(generateFormulaASTFromArray(["abs",[1]]), null, 2));

// Both logs the same output
/*
{
  "name": "abs",
  "type": "function",        
  "result_type": "number",   
  "args": [
    {
      "type": "constant",    
      "value": "1",
      "value_type": "number",
      "result_type": "number"
    }
  ]
}
*/
```