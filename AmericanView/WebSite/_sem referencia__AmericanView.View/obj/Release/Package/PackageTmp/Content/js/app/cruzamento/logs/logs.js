var gridData;
var grid;

$(document).ready(function () {
    InitializeComponents();
});

function InitializeComponents() {
    gridDs_load();
}

function gridDs_load() {
    $.ajax({
        url: "Logs/Get",
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
            schema: {
                model: {
                    fields: {
                        Data: { type: "datetime" },
                        Arquivo: { type: "string" },
                        Ocorrencia: { type: "string" }
                    }
                }
            }
        },
        scrollable: true,
        sortable: true,
        filterable: true,
        resizable: true,
        groupable: false,
        pageable: {
            refresh: true,
            pageSizes: [10, 25, 50]
        },
        columns: [
            {
                field: "Data", title: "Data", width: "20%",
                template: "#= kendo.toString(kendo.parseDate(Data), 'dd/MM/yyyy HH:mm:ss') #"
            },
            { field: "Arquivo", title: "Nome do Arquivo", width: "20%" },
            { field: "Ocorrencia", title: "Ocorrência", width: "60%" }
        ]
    }).data("kendoGrid");
}