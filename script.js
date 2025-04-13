function addField() {
    let fieldsDiv = document.getElementById('fields'); // Lấy div chứa tất cả các trường
    let fieldCount = fieldsDiv.children.length + 1; // Đếm số trường hiện tại
    let newField = document.createElement('div'); // Tạo thẻ div mới cho mỗi trường


    // Gán nội dung HTML (input + select + nút remove)
    newField.innerHTML = `Field ${fieldCount}: <input type="text" oninput="generateCode()"> 
        <select onchange="generateCode()">
            <option>Text</option>
            <option>Number</option>
            <option>Password</option>
            <option>Textarea</option>
            <option>Select</option>
            <option>Checkbox</option>
            <option>Radio</option>
            <option>Date</option>
            <option>Time</option>
            <option>DateTime</option>
            <option>Read only</option>
            <option>Hidden</option>
        </select> 
        <button onclick="removeField(this)">Remove</button>`;

        
    fieldsDiv.appendChild(newField);
    generateCode();
}

function removeField(button) {
    button.parentElement.remove();
    generateCode();
}
// Lấy tên bảng và khóa chính từ input người dùng
function generateCode() {
    let tableName = document.getElementById('tableName').value.trim();
    let primaryKey = document.getElementById('primaryKey').value.trim();

    // Lấy tất cả các trường nhập liệu trong #fields
    let fields = document.querySelectorAll('#fields div');
    let fieldDefs = []; // Dùng cho SQL + JS
    let fieldNames = []; // Dùng cho HTML table header + PHP
    
    // Duyệt qua từng trường
    fields.forEach((field, index) => {
        let fieldName = field.querySelector('input').value.trim(); 
        let fieldType = field.querySelector('select').value.trim();
        let sqlType = 'varchar(255)';
        
         // Mapping kiểu dữ liệu
        if (fieldType === 'Number') sqlType = 'INT';
        else if (fieldType === 'Date') sqlType = 'DATE';
        else if (fieldType === 'DateTime') sqlType = 'DATETIME';
        else if (fieldType === 'Time') sqlType = 'TIME';
       
        //fieldDefsPHP.push(`\`${fieldName}\` ${sqlType}`); // SQL + JS
        fieldDefs.push(`\`${fieldName}\` ${sqlType}`); // SQL + JS
        fieldNames.push(`${fieldName}`); // HTML + PHP
    });
    // // Lưu dữ liệu vào localStorage 
    localStorage.setItem('formBuilderData', JSON.stringify({
        tableName: tableName,
        primaryKey: primaryKey,
        fields: Array.from(fields).map(field => ({
            name: field.querySelector('input').value,
            type: field.querySelector('select').value
        }))
    }));
     // Gán kết quả vào biến toàn cục window.generatedCode
    window.generatedCode = {
        //----------------------------- Xuất code SQL-------------------------
          'SQL': `-- \n-- Editor SQL for DB table ${tableName}\n-- Created by http://editor.datatables.net/generator\n-- \n\nCREATE TABLE IF NOT EXISTS \`${tableName}\` (\n\t\`${primaryKey}\` int(10) NOT NULL auto_increment,\n${fieldDefs.join(',\n')},\n\tPRIMARY KEY( \`${primaryKey}\` )\n);`,
//---------------------------------xuất code HTML------------------------
        'HTML': `&lt;!doctype html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;meta http-equiv="content-type" content="text/html; charset=utf-8" /&gt;

&lt;title&gt;DataTables Editor - ${tableName}&lt;/title&gt;

&lt;link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/dt/jqc-1.12.4/moment-2.29.4/dt-2.2.2/b-3.2.2/date-1.5.5/sl-3.0.0/datatables.min.css"&gt;
&lt;link rel="stylesheet" type="text/css" href="css/generator-base.css"&gt;
&lt;link rel="stylesheet" type="text/css" href="css/editor.dataTables.min.css"&gt;

&lt;script type="text/javascript" charset="utf-8" src="https://cdn.datatables.net/v/dt/jqc-1.12.4/moment-2.29.4/dt-2.2.2/b-3.2.2/date-1.5.5/sl-3.0.0/datatables.min.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" charset="utf-8" src="js/dataTables.editor.min.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" charset="utf-8" src="js/table.2.js"&gt;&lt;/script&gt;
&lt;/head&gt;
&lt;body class="dataTables"&gt;
&lt;div class="container"&gt;

    &lt;h1&gt;
        DataTables Editor &lt;span&gt;${tableName}&lt;/span&gt;
    &lt;/h1&gt;
    
    &lt;table cellpadding="0" cellspacing="0" border="0" class="display" id="2" width="100%"&gt;
        &lt;thead&gt;
            &lt;tr&gt;
                ${fieldNames.map(name => `&lt;th&gt;${name}&lt;/th&gt;\n`).join('')}
                
            &lt;/tr&gt;
        &lt;/thead&gt;
    &lt;/table&gt;

&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;`,

//---------------------------------xuất code JS------------------------
      'Javascript': `/*
* Editor client script for DB table ${tableName}
* Created by http://editor.datatables.net/generator
*/
        
addEventListener("DOMContentLoaded", function () {
var editor = new DataTable.Editor({
ajax: 'php/table.${tableName}.php',
table: '#${tableName}',
fields: [\n${fieldNames.map(name =>`{\n\t"lable":"${name.trim()}:",\n\t"name":${name.trim()}\n},`).join('\n')}\n]
});

var table = new DataTable('#${tableName}', {
ajax: 'php/table.${tableName}.php',
columns: [\n${fieldNames.map(name =>`{\n\t"data":"${name.trim()}"},`).join('\n')}\n],

layout: {
    topStart: {
        buttons: [
            { extend: 'create', editor: editor },
            { extend: 'edit', editor: editor },
            { extend: 'remove', editor: editor }
        ]
    }
},
select: true
});
});`,
//---------------------------------xuất code PHP------------------------
       
       'PHP': `
<?php

/*
* Editor server script for DB table dynamic
* Created by http://editor.datatables.net/generator
*/

include( "lib/DataTables.php" );

use
DataTables\\Editor,
DataTables\\Editor\\Field,
DataTables\\Editor\\Format,
DataTables\\Editor\\Mjoin,
DataTables\\Editor\\Options,
DataTables\\Editor\\Upload,
DataTables\\Editor\\Validate,
DataTables\\Editor\\ValidateOptions;


$db->sql( "CREATE TABLE IF NOT EXISTS ${tableName} (
\`${primaryKey}\` int(10) NOT NULL auto_increment,
${fieldDefs.join(",\n")}
PRIMARY KEY(\`${primaryKey}\`)
);" );

Editor::inst( $db, '${tableName}', '${primaryKey}' )
->fields(
${fieldNames.map(name =>`Field::inst('${name.trim()}'),`).join('\n')}

)
->process( $_POST )
->json();
`

    };
}
// Nếu là PHP thì mã hóa các ký tự đặc biệt để hiển thị đúng
function viewCodeInNewPage(type) {
let code = window.generatedCode[type] || "No code generated.";

if (type === "PHP") {
// Chuyển đổi ký tự đặc biệt để hiển thị chính xác trên HTML
code = code
    .replace(/&/g, "&amp;")  // Chuyển đổi &
    .replace(/</g, "&lt;")   // Chuyển đổi <
    .replace(/>/g, "&gt;")   // Chuyển đổi >
    .replace(/"/g, "&quot;") // Chuyển đổi dấu "
    .replace(/'/g, "&#039;") // Chuyển đổi dấu '
    .replace(/\\/g, "&#92;");// Chuyển đổi dấu \

}
// Mở cửa sổ mới, hiển thị mã code tương ứng
let newWindow = window.open();
newWindow.document.write("<pre>" + code + "</pre>");
newWindow.document.title = type + " Code";
}



generateCode();

