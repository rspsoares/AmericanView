var grid;
var gridData;
var gridColumns = [];

var GridColumn = function (field, title) {
    this.field = field;
    this.title = title;
    this.width = '150px';
}

$(document).ready(function () {
    InitializeComponents();
});

function InitializeComponents() {
    PreencherCamposDetalhe();
    gridDs_load();
}

function PreencherCamposDetalhe() { 
    $("#lbRegra").text($("#hddRegra").val());
    $("#lbDescricao").text($("#hddRegraOcorrencia").val());
    $("#lbOcorrencias").text($("#hddNumOcorrencia").val());
}

function gridDs_load() {
    var idControle = $("#hddIdControle").val();
    var idCruzamento = $("#hddIdCruzamento").val();
    var idRegra = $("#hddIdRegra").val();
    var url = "/EFD/Detalhe/Get/?idControle=" + idControle + '&idCruzamento=' + idCruzamento + '&idRegra=' + idRegra;

    $.ajax({
        url: url,
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            gridData = result.data;
            setGridColumns(result.columns);
            grid_load();
        }
    });
}

function setGridColumns(cols) {
    cols.forEach(function(col) {
        var newCol = new GridColumn(col.Coluna, col.Rotulo);
        gridColumns.push(newCol);
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
                    }
                }
            }
        },
        toolbar: ["excel"],
        excel: {
            fileName: 'DetalhesSPED_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
        filterable: true,
        resizable: true,
        groupable: false,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: gridColumns,
        dataBound: function () {
            if (gridData.length > 0 && gridData[0].Template !== undefined) {
                var template;
                
                dataView = this.dataSource.view();
                for (var i = 0; i < dataView.length; i++) {
                    var uid = dataView[i].uid;
                    template = "<div><input type='button' value='Detalhe' onclick='getDetalhe(\"" + uid + "\")' /></div>";
                    var html = $("#grid tbody").find("tr[data-uid=" + uid + "]").html();
                    $("#grid tbody").find("tr[data-uid=" + uid + "] td:last").html(template);
                }
            }
        }
    }).data("kendoGrid");  
}

function getDetalhe(uid) {
    $("#loading-page").show();
    var paramValueArray = [];
    var row = $("#grid tbody").find("tr[data-uid='" + uid + "']")
    var dataItem = grid.dataItem(row);

    dataItem.forEach(function (e) {
        paramValueArray.push(e);
    });

    var idCruzamento = $("#hddIdCruzamento").val();
    var idRegra = $("#hddIdRegra").val();
    var data = {
        idCruzamento: idCruzamento, 
        idRegra: idRegra,
        paramValueArray: JSON.stringify(paramValueArray)
    };

    var url = "/EFD/Detalhe/GetDetalhe/" //?idCruzamento=" + idCruzamento + '&idRegra=' + idRegra + '&paramValueArray=' + paramValueArray;

    $.ajax({
        url: url,
        type: "GET",
        async: false,
        dataType: "json",
        data: data,
        cache: false,
        success: function (result) {
            showDetalhe(result);
        }
    });
    $("#loading-page").hide();
}

function showDetalhe(vm) {
    var modal = '#modalDetalhe';

    // Cabeçalho
    var detCaptionHtml = '';
    var detValueHtml = '';

    for (var prop in vm.header) {
        detCaptionHtml = detCaptionHtml + '<div class="col-md-3"><span class="regra">' + prop + '</span></div>';
        detValueHtml = detValueHtml + '<div class="col-md-3"><span class="regra regraValue">' + vm.header[prop] + '</span></div>';
    }
    
    $(modal + ' .regraHeader #detCaption').html('');
    $(modal + ' .regraHeader #detText').html('');
    $(modal + ' .regraHeader #detCaption').html(detCaptionHtml);
    $(modal + ' .regraHeader #detText').html(detValueHtml);
    //

    // Grid
    $(modal + " #grid").html("");
    var gridDet = $(modal + " #grid").kendoGrid({
        dataSource: {
            data: vm.data,
            pageSize: 10,
            schema: {
                model: {
                    fields: {
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
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: 'NomeRegra', title: 'TIPO DO ERRO' },
            { field: 'Mensagem', title: 'DESCRIÇÃO'}
        ]
    }).data("kendoGrid");
    //

    // Show Modal
    $(modal).modal({ backdrop: 'static', keyboard: false });
    $(modal + ' .modal-dialog .modal-header center .modal-title strong').html("");
    $(modal + ' .modal-dialog .modal-header center .modal-title strong').html("Detalhamento de Nota");
    //
}