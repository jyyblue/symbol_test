var himalaya = require('himalaya');
var stringify = require('json-stringify');
var fs = require('fs');
var path = require('path');
// var filePath = path.join(__dirname, 'test.html');
// var outPath = path.join(__dirname, 'output.txt');

const prompt = require('prompt');
prompt.start();
prompt.get(['html_file_name', 'output_file_name'], function (err, result) {
    if (err) { return console.log(err); }
    let inputPath = path.join(__dirname, result.html_file_name);
    let outputPath = path.join(__dirname, result.output_file_name);
    fs.readFile(inputPath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            let html = himalaya.parse(data.toString());
            let jsonStr = stringify(html);
            let jsonObj = JSON.parse(jsonStr);
            var jsonArray = [];            
            jsonObj.forEach(obj => {
                var jsonData = { 
                    // tag: '',
                    // id: '',
                    // class: '',
                    // style: {},
                    // text: '', 
                    // children: []
                };
                Object.entries(obj).forEach(([key, value]) => {
                    if ( key == 'tagName' ) {
                        jsonData['tag'] = value;
                    }
                    else if ( key == 'attributes' ) {
                        var attributesArr = value;
                        attributesArr.forEach(attributeobj => {                          
                            if ( attributeobj.key == 'id' ) {
                                jsonData['id'] = attributeobj.value;                                    
                            }
                            else if ( attributeobj.key == 'class' ) {
                                jsonData['class'] = attributeobj.value;
                            }
                            else if ( attributeobj.key == 'style' ) {
                                let styleJson = getStyle(attributeobj.value);
                                jsonData['style'] = styleJson;
                            }
                        });
                    }
                    else if ( key == 'children' ) {
                        let childJson = getChilds(jsonData, value);
                        if ( childJson.length > 0 ) {
                            jsonData['children'] = childJson;
                        }
                    }
                });
                jsonArray.push(jsonData);
                fs.writeFileSync(outputPath, stringify(jsonArray, null, 2));                
                // console.dir(jsonArray, {colors: true, depth: null});
            });
        } else {
            console.log(err);
        }
    });
});

function titleCase(string){
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

function getStyle(styleStr) {
    let styleArr = styleStr.split(';');
    var styleJson = {};
    styleArr.forEach(styleobj => {
        let arrItem = styleobj.split(':');
        let arrStyleName = arrItem[0].split('-');
        var styleName = '';
        if ( arrStyleName.length == 2 ) {                                        
            const arr1 = titleCase(arrStyleName[1]);
            styleName = arrStyleName[0] + arr1;
        }
        else {
            styleName = arrStyleName[0];
        }
        styleName = styleName.replaceAll(' ', '');
        styleJson[styleName] = arrItem[1].replaceAll(' ', '');
    });
    return styleJson;
}

function getChilds(parentObj, childList) {
    var childs = [];    
    childList.forEach(obj => {
        if ( obj.type == 'text' ) {
            var text = obj.content.replaceAll('\r\n', '');
            text = text.replaceAll('    ', '');
            if ( text.length > 0 ) {
                parentObj['text'] = text;
            }            
        }
        else if ( obj.type == 'element' ) {
            var childData = { 
                // tag: '',
                // id: '',
                // class: '',
                // style: {},
                // text: '', 
                // children: []
            };
            Object.entries(obj).forEach(([key, value]) => {
                if ( key == 'tagName' ) {
                    childData['tag'] = value;
                }
                else if ( key == 'attributes' ) {
                    var attributesArr = value;
                    attributesArr.forEach(attributeobj => {                          
                        if ( attributeobj.key == 'id' ) {
                            childData['id'] = attributeobj.value;                                    
                        }
                        else if ( attributeobj.key == 'class' ) {
                            childData['class'] = attributeobj.value;
                        }
                        else if ( attributeobj.key == 'style' ) {
                            let styleJson = getStyle(attributeobj.value);
                            childData['style'] = styleJson;
                        }
                    });
                }
                else if ( key == 'children' ) {
                    let childJson = getChilds(childData, value);
                    if ( childJson.length > 0 ) {
                        childData['children'] = childJson;
                    }
                }  
            });
            childs.push(childData);
        }
    });
    return childs;
}

function getChilds2(parentObj, childList) {

    var ret = childList.reduce(function(childs, obj) {

        if ( obj.type == 'text' ) {
            var text = obj.content.replaceAll('\r\n', '');
            text = text.replaceAll('    ', '');
            if ( text.length > 0 ) {
                parentObj['text'] = text;
            }            
        }
        else if ( obj.type == 'element' ) {
            var childData = { 
                // tag: '',
                // id: '',
                // class: '',
                // style: {},
                // text: '', 
                // children: []
            };
            Object.entries(obj).forEach(([key, value]) => {
                if ( key == 'tagName' ) {
                    childData['tag'] = value;
                }
                else if ( key == 'attributes' ) {
                    var attributesArr = value;
                    attributesArr.forEach(attributeobj => {                          
                        if ( attributeobj.key == 'id' ) {
                            childData['id'] = attributeobj.value;                                    
                        }
                        else if ( attributeobj.key == 'class' ) {
                            childData['class'] = attributeobj.value;
                        }
                        else if ( attributeobj.key == 'style' ) {
                            let styleJson = getStyle(attributeobj.value);
                            childData['style'] = styleJson;
                        }
                    });
                }
                else if ( key == 'children' ) {
                    let childJson = getChilds2(childData, value);
                    if ( childJson.length > 0 ) {
                        childData['children'] = childJson;
                    }
                }  
            });
            childs.push(childData);
        }

        return childs;
    }, []);

    return ret;
}


