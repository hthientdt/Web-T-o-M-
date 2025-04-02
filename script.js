function addField() {
    let fieldsDiv = document.getElementById('fields');
    let fieldCount = fieldsDiv.children.length + 1;
    let newField = document.createElement('div');
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

function generateCode() {
    let tableName = document.getElementById('tableName').value;
    let primaryKey = document.getElementById('primaryKey').value;
    let fields = document.querySelectorAll('#fields div');
    let fieldDefs = [];
    let fieldNames = [];
    
    fields.forEach((field, index) => {
        let fieldName = field.querySelector('input').value;
        let fieldType = field.querySelector('select').value;
        let sqlType = 'varchar(255)';
        
        if (fieldType === 'Number') sqlType = 'INT';
        else if (fieldType === 'Date') sqlType = 'DATE';
        else if (fieldType === 'DateTime') sqlType = 'DATETIME';
        else if (fieldType === 'Time') sqlType = 'TIME';
       
        
        fieldDefs.push(`${fieldName} ${sqlType}`);
        fieldNames.push(`${fieldName}`);
    });
    
    window.generatedCode = {
          'SQL': `-- \n-- Editor SQL for DB table ${tableName}\n-- Created by http://editor.datatables.net/generator\n-- \n\nCREATE TABLE IF NOT EXISTS \`${tableName}\` (\n\t\`${primaryKey}\` int(10) NOT NULL auto_increment,\n${fieldDefs.join(',\n')},\n\tPRIMARY KEY( \`${primaryKey}\` )\n);`,
        
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


      'Javascript': `/*
* Editor client script for DB table ${tableName}
* Created by http://editor.datatables.net/generator
*/
        
addEventListener("DOMContentLoaded", function () {
var editor = new DataTable.Editor({
ajax: 'php/table.${tableName}.php',
table: '#${tableName}',
fields: ${JSON.stringify(fieldDefs, null, 4)}
});

var table = new DataTable('#${tableName}', {
ajax: 'php/table.${tableName}.php',
columns: [
    ${fieldDefs.join(",\n")}
],
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
       
       'PHP': `
<?php

/*
* Editor server script for DB table dynamic
* Created by http://editor.datatables.net/generator
*/

include( "lib/DataTables.php" );

use
DataTables\ Editor,
DataTables\ Editor\ Field,
DataTables\ Editor\ Format,
DataTables\Editor\Mjoin,
DataTables\Editor\Options,
DataTables\Editor\Upload,
DataTables\Editor\Validate,
DataTables\Editor\ValidateOptions;

$tableName = $_GET["tableName"] ?? "default_table";
$primaryKey = "id";

$db->sql( "CREATE TABLE IF NOT EXISTS $tableName (
${fieldDefs.join(",\n")}
PRIMARY KEY( \`${primaryKey}\` )
);" );

Editor::inst( $db, $tableName, $primaryKey )
->fields(
${fieldNames.map(name => `Field::inst('${name}''),`).join('\n')}

Field::inst( "time" )
    ->validator( Validate::dateFormat( "H:i" ) )
    ->getFormatter( Format::datetime( "H:i:s", "H:i" ) )
    ->setFormatter( Format::datetime( "H:i", "H:i:s" ) ),
Field::inst( "date" )
    ->validator( Validate::dateFormat( "D, j M y" ) )
    ->getFormatter( Format::dateSqlToFormat( "D, j M y" ) )
    ->setFormatter( Format::dateFormatToSql( "D, j M y" ) )
)
->process( $_POST )
->json();
') . "</pre>";
?>
`

    };
}

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

let newWindow = window.open();
newWindow.document.write("<pre>" + code + "</pre>");
newWindow.document.title = type + " Code";
}


generateCode();