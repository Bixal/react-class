import React from 'react';
import ReactDOM from 'react-dom';
import { Slider } from 'react-toolbox';

var integerElements = document.getElementsByClassName(['react-field-integer']);
Array.prototype.map.call(integerElements, function(i) {
  ReactDOM.render(
    <Slider pinned min={i.getAttribute("field_min")} max={i.getAttribute("field_max")} value={ 
i.textContent } />,
    i
  )

});

