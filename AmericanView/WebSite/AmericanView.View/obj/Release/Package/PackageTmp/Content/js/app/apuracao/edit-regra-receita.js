function BuscarDadosGridEdit(id) {
    $("#loading-page").show();
    $("#gridEdit").html("");
    $("#gridEdit").removeAttr("class");
    $("#gridEdit").removeAttr("data-role");

    $("#gridEdit").kendoGrid({
        toolbar: ["excel"],
        excel: {
            fileName: 'RegraDetalhesReceita_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
        dataSource: GetDsGridEdit(id),
        scrollable: true,
        sortable: true,
        resizable: true,
        dataBound: gridDataBound,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 10
        },
        columns: [
            { field: "SelectItem", title: "&nbsp;", width: "30px", template: "#=GetSelectionRegra(data.SelectItem)#", sortable: false },
            {
            title: "CFOP",
            field: "CFOP",
            width: "55px"
        }, {
            title: "Descrição",
            field: "Descricao",
            width: "200px"
        }, {
            title: "Dígito",
            field: "Digito",
            width: "50px"
        }, {
            title: "CFOP Referência",
            field: "CFOPRef",
            width: "110px"
        }, {
            title: "Categoria Nota",
            field: "CategoriaNota",
            width: "100px"
        }, {
            title: "CST",
            field: "CST",
            width: "50px"
        }, {
            title: "Grupo Material",
            field: "GrupoMaterial",
            width: "250px"
        }, {
            title: "Material",
            field: "Material"
        }, {
            title: "Data Criação",
            field: "DataCriacao",
            template: "#= kendo.toString(kendo.parseDate(DataCriacao, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #",
            width: "130px", hidden: true
        }, {
            title: " ",
            template: "<a onclick='javascript:{EditCondicao(this);}' class='k-button'>"
                + "<span title='Editar Condição' class='glyphicon glyphicon-pencil'></span></a>",
            width: "48px",
            filterable: false
        }]
    });
    $("#loading-page").hide();
}

function GetDsGridEdit(id) {
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Apuracao/GetRuleParameters?Id=" + id,
                type: "GET",
                dataType: "json",
                cache: false,
                async: false
            }
        },
        pageSize: 10,
        model: {
            id: "Id",
            fields: {
                SelectItem: { editable: true, type: "boolean" },
                IdRegra: { editable: false },
                CST: { editable: false },
                CFOP: { editable: false },
                CFOPRef: {editalbe: false},
                Descricao: { editable: false },
                Digito: { editable: false },
                CategoriaNota: { editable: false },
                Material: { editable: false },
                DataCriacao: { editable: false, type: "date" }
            }
        }
    });
    return dataSource;
}

function gridDataBound(e) {
    var grid = e.sender;
    if (grid.dataSource.total() == 0) {
        var colCount = grid.columns.length;
        $(e.sender.wrapper)
            .find('tbody')
            .append('<tr class="kendo-data-row"><td colspan="' + colCount + '" class="no-data">Nenhuma Regra Registrada</td></tr>');
    }
}

function GetSelectionRegra(isSelected) {
    if (isSelected) {
        return "<input class='checkedRow' name='checkedRow' onclick='javascript:{SelecionarItemEdit(this);}' type='checkbox' value='true' checked='checked' />";
    }
    else {
        return "<input class='checkedRow' name='checkedRow' onclick='javascript:{SelecionarItemEdit(this);}' type='checkbox' value='false' />";
    }
}

function SelecionarItemEdit(e) {
    var dataItem = $("#gridEdit").data("kendoGrid").dataItem(e.parentElement.parentElement);
    if (e.checked) {
        dataItem.SelectItem = true;
    }
    else {
        dataItem.SelectItem = false;
    }
}

function OpenModalCreate() {
    $("#loading-page").show();
    $('#modalViewReceita').modal('hide');

    $('#txtIdCondicao').val("");
    var cstVal = $('#txtCST').data("kendoDropDownList");
    cstVal.value([]);

    var cfopVal = $('#txtCFOP').data("kendoMultiSelect");
    cfopVal.value([]);
    $('#descCFOP').text("");

    var cfopValRef = $('#txtCFOPReferencia').data("kendoMultiSelect");
    cfopValRef.value([]);


    $('#txtCatNota').val("");
    $('#txtGrupoMaterial').val("");
    $('#txtMaterial').val("");

    $('#modalCreateReceita').modal('show');

    $("#loading-page").hide();
}

function EditCondicao(e) {
    $("#loading-page").show();
    $('#modalViewReceita').modal('hide');

    var dataItem = $("#gridEdit").data("kendoGrid").dataItem(e.parentElement.parentElement);
    $('#descCFOP').text("");
    $('#txtIdCondicao').val(dataItem.Id);

    var cfopVal = $('#txtCFOP').data("kendoMultiSelect");
    cfopVal.value([]);
    var cfop = dataItem.CFOP;
    if (cfop != null) {
        cfopVal.value(cfop.split("/"));
    }
    var dataCFOP = cfopVal.dataItems();
    for (var i in dataCFOP) {
 ///       $('#descCFOP').append(dataCFOP[i].Descricao + "<br />");
    }
 ///   $('#descCFOP').append("<br />");

    var cfopValRef = $('#txtCFOPReferencia').data("kendoMultiSelect");
    cfopValRef.value([]);
    var cfopRef = dataItem.CFOPRef;
    if (cfopRef != null) {
        cfopValRef.value(cfopRef.split("/"));
        var dataCFOPRef = cfopValRef.dataItems();
      /*  for (var i in dataCFOP) {
            $('#descCFOP').append(dataCFOP[i].Descricao + "<br />");
        }
        $('#descCFOP').append("<br />");
        */
    }

    var cstVal = $('#txtCST').data("kendoDropDownList");
    cstVal.value([]);
    if (dataItem.CST != null) {
        cstVal.text(dataItem.CST);
    }

    $('#txtCatNota').val(dataItem.CategoriaNota);
    $('#txtGrupoMaterial').val(dataItem.GrupoMaterial);
    $('#txtMaterial').val(dataItem.Material);

    $('#modalCreateReceita').modal('show');
    $("#loading-page").hide();
}

function ExcluirCondicoes() {
   // $("#loading-page").show();

    var dataItem = $("#gridEdit").data("kendoGrid");
    dataItem = dataItem._data;

    var obj = [];

    var idRegra = $('#txtIdRegra').val();
    for (var i in dataItem) {
        if (dataItem[i].SelectItem) {
            obj.push({
                Id: dataItem[i].Id,
                IdRegra: idRegra
            });
        }
    }

    if (obj.length > 0) {
        $.ajax({
            url: "/Apuracao/DeleteCondicoes",
            data: JSON.stringify(obj),
            type: 'POST',
            async: false,
            contentType: 'application/json; charset=utf-8',
            success: function (res) {
                $('#modalCreateCredito').modal('hide');
                var idRegra = $('#txtIdRegra').val();
                BuscarDadosGridEdit(idRegra);
                $('#modalViewCredito').modal({ backdrop: 'static', keyboard: false });
                $('#modalViewCredito').modal('show');
                ShowModalAlerta(res.Msg);
                $('#modalViewCredito').modal({ backdrop: 'static', keyboard: false });
                $('#modalViewCredito').modal('show');

            }

        });
    } else {
        ShowModalAlerta('Para excluir é necessário selecionar as condições desejadas');
    }
}