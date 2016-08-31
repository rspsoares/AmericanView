function GetObj() {
    var obj = [];

    obj.push({
        IdEmpresa: $('#txtCodMatriz').val(),
       // TipoImposto: $('#txtTipoImposto').val(),
        TipoApuracao: $('#txtTipoApuracao').val()
    });

    return obj;
}

function BuscarDadosGrid(obj) {
    $("#grid").html("");
    $("#grid").removeAttr("class");
    $("#grid").removeAttr("data-role");

    $("#grid").kendoGrid({
        dataSource: GetDsGrid(obj),
        scrollable: true,
        sortable: true,
        resizable: true,
        dataBound: gridDataBound,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 10
        },
        columns: [{
            title: "Código",
            field: "CodigoRegra"
        }, {
            title: "Descrição",
            field: "UltimaModificacao"
        }, {
            title: "Data Modificação",
            field: "DataUltimaModificacao",
            template: "#= kendo.toString(kendo.parseDate(DataUltimaModificacao, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #",
            width: "130px"
        }, {
            title: " ",
            template: "<a onclick='javascript:{ShowDetails(this);}' class='k-button'>"
                + "<span title='Visualizar Log' class='glyphicon glyphicon-search'></span></a>",
            width: "48px",
            filterable: false
        }]
    });
}

function GetDsGrid(obj) {
    $("#loading-page").show();
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Logs/GetLogs",
                type: "POST",
                data: obj,
                dataType: "json",
                cache: false
            }
        },
        pageSize: 10,
        model: {
            id: "IdRegra",
            fields: {
                CodigoRegra: { editable: false },
                UltimaModificacao: { editable: false },
                DataUltimaModificacao: { editable: false, type: "date" }
            }
        }
    });
    $("#loading-page").hide();
    return dataSource;
}

function gridDataBound(e) {
    var grid = e.sender;
    if (grid.dataSource.total() == 0) {
        var colCount = grid.columns.length;
        $(e.sender.wrapper)
            .find('tbody')
            .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">Nenhum Log Registrado</td></tr>');
    }
}

function ShowDetails(e) {
    $("#loading-page").show();
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);

    $.ajax({
        url: "/Logs/GetLogDetails?IdRegra=" + dataItem.IdRegra,
        type: "GET",
        dataType: "json",
        async: true,
        cache: false,
        success: function (ds) {
            if (ds.length > 0) {
                $('#usuarioTxt').val(ds[0].Nome);
                $('#ocorrenciaTxt').val(kendo.toString(kendo.parseDate(ds[0].DataLog, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss'));
                $('#descricaoTxt').val(ds[0].Descricao);

                $('#modalViewLogs').modal('show');
            }
            else {
                var msg = "<p>Erro ao Trazer os Dados.</p>"
                ShowModalAlerta(msg);
            }
            $("#loading-page").hide();
        }
    });
}