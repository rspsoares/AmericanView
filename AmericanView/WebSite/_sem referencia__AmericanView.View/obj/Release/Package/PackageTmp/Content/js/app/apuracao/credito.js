function GetObj() {
    var obj = [];

    var matrizList = $('#txtCodMatriz').data("kendoDropDownList");
    var idMatriz = matrizList.dataItem().Id;
    obj.push({
        IdEmpresa: idMatriz,
        //TipoImposto: $('#txtTipoImposto').val(),
        TipoApuracao: 1
    });

    return obj;
}

function BuscarDadosGrid(obj) {
    $("#grid").html("");
    $("#grid").removeAttr("class");
    $("#grid").removeAttr("data-role");

    $("#grid").kendoGrid({
        toolbar: ["excel"],
        excel: {
            fileName: 'RegrasCredito_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
            field: "Codigo",
            width: "55px"
        }, {
            title: "Descrição",
            //field: "SituacaoTributariaDescricao"
            field: "MosaicDescricao"
        }, {
            field: "SelectItem",
            title: "Ativa",
            width: "45px",
            template: "#=AtivarRegra(data.SelectItem)#", sortable: false
        }, {
            title: " ",
            template: "<a onclick='javascript:{EditRegra(this);}' class='k-button'>"
                + "<span title='Editar Regra' class='glyphicon glyphicon-pencil'></span></a>",
            width: "48px",
            filterable: false
        }]
    });
    var kendoGrid = $("#grid").data('kendoGrid');
    var dsSort = [];
    dsSort.push({ field: "MosaicTipo", dir: "asc" });
    kendoGrid.dataSource.sort(dsSort);
}

function GetDsGrid(obj) {
    $("#loading-page").show();
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Apuracao/GetRules",
                type: "POST",
                data: obj,
                dataType: "json",
                cache: false,
                async: false
            }
        },
        pageSize: 10,
        model: {
            id: "Id",
            fields: {
                IdControle: { editable: false },
                NaturezaCodigo: { editable: false },
                NaturezaDescricao: { editable: false },
                MosaicTipo: { editable: false },
                MosaicDescricao: { editable: false },
                SituacaoTributariaCodigo: { editable: false },
                SituacaoTributariaDescricao: { editable: false },
                DataCriacao: { editable: false, type: "date" }
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
            .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">Nenhuma Apuração de Crédito Registrada</td></tr>');
    }
}

function AtivarRegra(isSelected) {
    if (isSelected) {
        return "<input class='checkedRow' name='checkedRow' onclick='javascript:{SelecionarItem(this);}' type='checkbox' value='true' checked='checked' />";
    }
    else {
        return "<input class='checkedRow' name='checkedRow' onclick='javascript:{SelecionarItem(this);}' type='checkbox' value='false' />";
    }
}

function SelecionarItem(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    if (e.checked) {
        dataItem.SelectItem = true;
    }
    else {
        dataItem.SelectItem = false;
    }
}

function EditRegra(e) {
    $("#loading-page").show();
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
  //  $('#Titulo').val('Regra n°: ' + dataItem.Codigo);

    $('#txtIdRegra').val(dataItem.Id);
    $('#txtCodRegra').val(dataItem.Codigo);


    $('#txtCodMatrizEdit').val($('#txtCodMatriz').val());
    $('#txtDescMatriz').val($('#txtRazaoSocial').val());

    //var tipoImposto = $('#txtTipoImposto').val();
    $('#txtTipoImpostoEdit').val('01 / 02');
    //$('#txtDescTipoImposto').val((tipoImposto == 1) ? "PIS" : "COFINS");
    $('#txtDescTipoImposto').val('PIS / COFINS');
  
   /// $('#txtCodSitTributaria').val(dataItem.SituacaoTributariaCodigo);
   /// $('#txtDescCodSitTributaria').val(dataItem.SituacaoTributariaDescricao.trim());

    $('#txtNaturezaReceita').val(dataItem.NaturezaCodigo);
    $('#txtDescNaturezaReceita').val(dataItem.NaturezaDescricao.trim());

    $('#txtTipoMosaic').val(dataItem.MosaicTipo);
    $('#txtDescTipoMosaic').val(dataItem.MosaicDescricao.trim());

    BuscarDadosGridEdit(dataItem.Id);
    $('#modalViewCredito').modal({ backdrop: 'static', keyboard: false });
    $('#modalViewCredito').modal('show');
    $("#loading-page").hide();
}