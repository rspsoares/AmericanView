var gridData;
var grid;

$(document).ready(function () {
    InitializeComponents();
});

function InitializeComponents() {
    gridDs_load();
}

function gridDs_load() {
    var idControle = $("#hddIdControle").val();
    $.ajax({
        url: "/EFD/Resumo/Get/?idControle=" + idControle,
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            gridData = result.data;
            grid_load();
        }
    });
}

function grid_load() {
    $("#grid").html("");
    grid = $("#grid").kendoGrid({
        dataSource: {
            data: gridData,
            pageSize: 10,          
            sort: {
                field: "RegraCampo",
                dir: "asc"
            }
        },
        toolbar: ["excel"],
        excel:{
            fileName: 'SumarioSPED_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
            allPages: true
        },
        excelExport: function (e) {
            var sheet = e.workbook.sheets[0];
            for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                if (rowIndex % 2 == 0) {
                    var row = sheet.rows[rowIndex];
                    for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                        row.cells[cellIndex].background = "#aabbcc";
                    }
                }
            }
        },
        scrollable: true,
        sortable: true,
        filterable: false,
        resizable: true,
        groupable: false,
        pageable: {
            pageSizes: [10, 25, 50]
        }, 
        columns: [
            { width: '20%', field: "RegraCampo", title: "Campo" },
            { width: '60%', field: "RegraOcorrencia", title: "Mensagem" },
            { width: '10%', field: "NumOcorrencias", title: "Ocorrências" },
            { width: '10%', field: "IdControleCruzamento", title: "Detalhes", template: kendo.template($("#srcResumoColAction").html()), attributes: { style: "text-align:center;" } }
        ]
    }).data("kendoGrid");
}
