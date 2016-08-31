function CFOPCredito() {
    var cfopList = $("#txtCFOP").kendoMultiSelect({
        itemTemplate: kendo.template('<span class="CFOP">#= CFOP # -</span> #= Descricao #'),
        optionLabel: "Selecione um CFOP...",
        dataTextField: "CFOP",
        dataValueField: "CFOP",
        dataSource: GetDsCFOP(),
        change: onChangeCFOP,
        select: onSelectCFOP
    }).data("kendoMultiSelect");
}

function onSelectCFOP(e) {
    //////$('#descCFOP').text("");
    //////var dataItem = this.dataItem(e.item);
    //////$('#descCFOP').text(dataItem.Descricao);
}
function onChangeCFOP(e) {
    //////$('#descCFOP').text("");
    //////var dataItem = this.dataItems();
    //////for (var i in dataItem) {
    //////    $('#descCFOP').append(dataItem[i].Descricao + "<br />");
    //////}
    //////$('#descCFOP').append("<br />");
}
function GetDsCFOP() {
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Apuracao/GetCFOPCredito",
                type: "GET",
                dataType: "json",
                cache: false
            }
        },
        model: {
            id: "Id",
            fields: {
                CFOP: { editable: false },
                Descricao: { editable: false }
            }
        }
    });
    return dataSource;
}

function CSTCredito() {
    var cfopList = $("#txtCST").kendoMultiSelect({
        optionLabel: "Selecione um CST...",
        dataTextField: "Codigo",
        dataValueField: "Codigo",
        dataSource: GetDsCST()
    }).data("kendoMultiSelect");
}

function GetDsCST() {
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Apuracao/GetCSTCredito",
                type: "GET",
                dataType: "json",
                cache: false
            }
        },
        model: {
            id: "Id",
            fields: {
                Codigo: { editable: false },
                Descricao: { editable: false }
            }
        }
    });
    return dataSource;
}

function SalvarCondicao(e) {
    $("#loading-page").show();
    var obj = [];
    var cstSelect = $("#txtCST").data("kendoMultiSelect").dataItems();
    var cst = "";
    for (var i in cstSelect) {
        if (cst == "")
            cst += cstSelect[i].Codigo;
        else
            cst += "/" + cstSelect[i].Codigo;
    }
    var consiste = $('#txtCatNota').val() + $('#txtGrupoMaterial').val() + $('#txtMaterial').val();
    consiste += $("#txtCST").data("kendoMultiSelect").value().length == 0 ? '' : '1';
    consiste += $("#txtCFOP").data("kendoMultiSelect").value().length == 0 ? '' : '1';
    ///consiste += $("#txtCFOPReferencia").data("kendoMultiSelect").value().length == 0 ? '' : '1';


    if (consiste.trim() != '') {
        var cfopSelect = $("#txtCFOP").data("kendoMultiSelect").dataItems();
        var cfop = "";
        for (var i in cfopSelect) {
            if (cfop == "")
                cfop += cfopSelect[i].CFOP;
            else
                cfop += "/" + cfopSelect[i].CFOP;
        }
        if (cst.substring(0, 3) == 'Sel') {
            cst = "";
        }
        if (cfop.substring(0, 3) == 'Sel') {
            cfop = "";
        }


        var cfopRefSelect = $("#txtCFOPReferencia").data("kendoMultiSelect").dataItems();
        var cfopRef = "";
        for (var i in cfopRefSelect) {
            if (cfopRef == "")
                cfopRef += cfopRefSelect[i].Codigo;
            else
                cfopRef += "/" + cfopRefSelect[i].Codigo;
        }

        var idRegra = $('#txtIdRegra').val();
        var idCondicao = $('#txtIdCondicao').val();
        var urlService = "";
        var msgCond = "";
        if (idCondicao == "") {
            urlService = "/Apuracao/CreateCondicao";
            obj.push({
                IdRegra: idRegra,
                CST: cst,
                CFOP: cfop,
                CFOPRef: cfopRef,
                CategoriaNota: $('#txtCatNota').val(),
                GrupoMaterial: $('#txtGrupoMaterial').val(),
                Material: $('#txtMaterial').val()
            });
            msgCond = "Criada";
        }
        else {
            urlService = "/Apuracao/EditCondicao";
            obj.push({
                Id: idCondicao,
                IdRegra: idRegra,
                CST: cst,
                CFOP: cfop,
                CFOPRef: cfopRef,
                CategoriaNota: $('#txtCatNota').val(),
                GrupoMaterial: $('#txtGrupoMaterial').val(),
                Material: $('#txtMaterial').val()
            });
            msgCond = "Alterada";
        }

        $.ajax({
            url: urlService,
            data: JSON.stringify(obj[0]),
            type: 'POST',
            async: false,
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
                if (result.Sucesso) {
                    FecharModalParam(e);
                    ShowModalSucesso(result.Msg);
                }
                else {
                    ShowModalAlerta(result.Msg);
                }
            }
        });
    }
    else {
        $("#loading-page").hide();
      //  $('#txtCFOP').parent().parent().children('label').attr('style', 'color: #ff0000;');
        var msg = "<p>Preencha os pelo menos um dos Campos Obrigatórios.</p>";
        ShowModalAlerta(msg);
    }
}

function FecharModalParam(e) {
    $("#loading-page").show();
    $('#' + e.parentElement.parentElement.parentElement.parentElement.id).modal("hide");

    var idRegra = $('#txtIdRegra').val();
    BuscarDadosGridEdit(idRegra);

    $('#modalViewCredito').modal({ backdrop: 'static', keyboard: false });
    $('#modalViewCredito').modal('show');
    $("#loading-page").hide();
}