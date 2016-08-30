function CarregaComponentesAnalitico() {
    var idControle = 0;
    var idControle = location.search.split('idcontrole=')[1] ? location.search.split('idcontrole=')[1] : '0';
    GetResultados(idControle);
}

function GetResultados(idControle) {
    var dsRegrasGeradas = undefined;
    var montarCaixas = false;

    $("#loading-page").show();
    //Recuperar as regras de apuração geradas para esse Período
    $.ajax({
        url: "/Relatorios/BuscarRegras",
        type: "GET",
        data: { idControle: idControle },
        dataType: "json",
        cache: true,
        async: false,
        success: function (result) {
            if (result.Data.length > 0) {
                dsRegrasGeradas = result.Data;
                montarCaixas = true;
            }
            else
                alert('Ainda não foram geradas valores para essa apuração.');
        }
    });
    $("#loading-page").hide();

    if (montarCaixas) {
        MontarPaineis(dsRegrasGeradas);
    }
}

/*PAINES - Requisição de Criações*/
function MontarPaineis(dsRegrasGeradas) {
    var content = "";
    var intSideBar = 1;
    var idPanel = 1;
    for (var i = 0; i < dsRegrasGeradas.length; i++) {
        var codigoRegra = parseInt(dsRegrasGeradas[i].Codigo);
        var refRegra = codigoRegra > 199 ? 20 : 10;

        if (intSideBar % refRegra > 3)
            intSideBar = refRegra + 1;
        else if (intSideBar < 10)
            intSideBar = refRegra + intSideBar;

        var dsDetalhesGerados = undefined;
        var montarDetalhe = false;
        content += "<div id='sideBar" + intSideBar + "' class='col-lg-4 col-md-4 col-sm- col-xs-12'>";
        content += "</div>";               

        if (codigoRegra > 200) 
            $(content).appendTo('#tbReceitaContent');
        else
            $(content).appendTo('#tbCreditoContent');

        content = "";
        MontarDetalhes(dsRegrasGeradas[i].Descricao, idPanel, intSideBar);
        CreateGridKendo(idPanel, dsRegrasGeradas[i].IdSumario);
        idPanel++;
        intSideBar++;
    }

    $("#topBar1").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#sideBar11,#sideBar12,#sideBar13",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });

    $("#sideBar11").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#topBar1,#sideBar12,#sideBar13",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });

    $("#sideBar12").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#topBar1,#sideBar11,#sideBar13",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });

    $("#sideBar13").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#topBar1,#sideBar11,#sideBar12",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });


    $("#topBar2").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#sideBar21,#sideBar22,#sideBar23",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });

    $("#sideBar21").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#topBar2,#sideBar22,#sideBar23",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });

    $("#sideBar22").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#topBar2,#sideBar21,#sideBar23",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });

    $("#sideBar23").kendoSortable({
        filter: ">div",
        cursor: "move",
        connectWith: "#topBar2,#sideBar21,#sideBar22",
        placeholder: placeholder,
        hint: hint,
        ignore: "input"
    });
}

/*PAINÉIS - Requisição de Montagem dos Detalhes*/
function MontarDetalhes(descricao, idPanel, intSideBar) {
    var contentPanel = "";
    //Montagem de cabeçalho
    contentPanel += "<div id='panel" + idPanel + "' class='panel-group'>";
    contentPanel += "<div class='panel panel-default'>";
    contentPanel += "<div class='panel-heading' data-toggle='collapse' data-parent='#panel" + idPanel + "' href='#collapsePanel" + idPanel + "' aria-expanded='true'>";
    contentPanel += "<h4 class='panel-title'>";
    contentPanel += "<small><span class='glyphicon glyphicon-chevron-down'></span></small> " + descricao
    contentPanel += "</h4>";
    contentPanel += "</div>";

    contentPanel += "<div id='collapsePanel" + idPanel + "' class='panel-collapse collapse' aria-expanded='true'>";

    //Abertura <div> panel-body
    contentPanel += "<div class='panel-body'>";
    //grid principal
    contentPanel += "<div id='gridPanel" + idPanel + "' class='grid'></div>";
    //FECHANDO BODY
    contentPanel += "</div>";

    //FOOTER
    contentPanel += "<div class='panel-footer fixed'>";
    contentPanel += "<div class='row'>";
    
    contentPanel += "</div>";//fechamento <div> row
    contentPanel += "</div>";//fechamento <div> panel-footer

    contentPanel += "</div>";//fechamento <div> collapsePanel
    contentPanel += "</div>";//fechamento <div> panel panel-default'
    contentPanel += "</div>";//fechamento <div> panel-group

    $(contentPanel).appendTo("#sideBar" + intSideBar);
}

function CreateGridKendo(idPanel, idSumario) {        
    $("#gridPanel" + idPanel).kendoGrid({
        dataSource: {
            autoSync: true,
            transport: {
                read: {
                    url: "/Relatorios/BuscarDetalhes",
                    type: "GET",
                    dataType: "json",
                    cache: false,
                    async: true
                },
                update: {
                    url: "/Relatorios/AtualizarOutrosDetalhes",
                    dataType: "json",
                    type: "POST",
                    async: false,//aguardamos a atualização
                    cache: false,
                    contentType: "application/json",//necessário para stringfy
                    complete: function (e) {
                        $("#gridPanel" + idPanel).data("kendoGrid").dataSource.read();
                    }
                },
                parameterMap: function (data, type) {
                    if (type == "read") {
                        return {
                            idSumario: idSumario
                        };
                    }

                    if (type == "update") {
                        return JSON.stringify({ entidade: data });
                    }
                }
            },
            pageSize: 100,
            schema: {
                data: function (result) {
                    return result.Data;
                },
                model: {
                    id: "Id",
                    fields: {
                        IdSumario: { type: "integer", editable: false },
                        Agregador: { type: "string", editable: false },
                        Base: { type: "number", editable: true },
                        Pis: { type: "number", editable: true },
                        Cofins: { type: "number", editable: true },
                        Totalizadora: { type: "integer", editable: false }
                    }
                }
            },
            aggregate: [
                { field: "Base", aggregate: "sum" },
                { field: "Pis", aggregate: "sum" },
                { field: "Cofins", aggregate: "sum" }
            ]
        },
        scrollable: false,
        sortable: true,
        resizable: true,
        groupable: false,
        pageable: false,
        editable: "incell",
        edit: function (e) {
            if (e.model.Agregador != "Outros")
                $("#gridPanel" + idPanel).data("kendoGrid").closeCell();
        },
        columns: [            
            { field: "IdSumario", hidden: true },
            { field: "Agrupador", hidden: true },
            { field: "Totalizadora", hidden: true },
            { title: "Agregador", template: "<a onclick='javascript: { ExibirDocumentosFiscaisAgrupador(this," + idPanel + "); }' style='cursor: pointer;'>#=Agregador#</a>", width: "140px" },
            { field: "Base", title: "BASE", width: '80px', template: "#=Base.formatMoney(2, ',', '.')#", aggregates: ["sum"], footerTemplate: "Total: #=sum.formatMoney(2, ',', '.')#" },
            { field: "Pis", title: "PIS", width: '80px', template: "#=Pis.formatMoney(2, ',', '.')#", aggregates: ["sum"], footerTemplate: "Total: #=sum.formatMoney(2, ',', '.')#" },
            { field: "Cofins", title: "COFINS", width: '80px', template: "#=Cofins.formatMoney(2, ',', '.')#", aggregates: ["sum"], footerTemplate: "Total: #=sum.formatMoney(2, ',', '.')#" }
        ]
    });
}

function ExibirDocumentosFiscaisAgrupador(e, idPanel)
{
    var dsGrid = [];
    var dataItem = $("#gridPanel" + idPanel).data("kendoGrid").dataItem(e.parentElement.parentElement);
    
    if (dataItem.Agregador != "Outros") {
        if (dataItem.Totalizadora == 0)
            CarregarDocumentosFiscaisRegraNaoTotalizadora(dataItem);
        else
            CarregarDocumentosFiscaisRegraTotalizadora(dataItem);
      

        $('#modalDocumentosFiscais').modal({ backdrop: 'static', keyboard: false });
        $('#modalDocumentosFiscais .modal-dialog .modal-header center .modal-title strong').html("");
        $('#modalDocumentosFiscais .modal-dialog .modal-header center .modal-title strong').html('Documentos Fiscais da Regra');
    }
    else
        ShowModalAlerta('Não existem Documentos Fiscais associados a esse item.');
}

function CarregarDocumentosFiscaisRegraNaoTotalizadora(dataItem) {
    $.ajax({
        url: "/Relatorios/BuscarDocumentosFiscais?IdSumario=" + dataItem.IdSumario + '&Agrupador=' + dataItem.Agrupador + '&Agregador=' + dataItem.Agregador,
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso) {
                dsGrid = result.Data;
            }
            else
                ShowModalAlerta(result.Msg);
        }
    });
  
    $("#gridDocumentosFiscaisAnalitico").html("");

    var grid =
    $("#gridDocumentosFiscaisAnalitico").kendoGrid({
        toolbar: ["excel"],
        excel: {
            fileName: 'DocumentosFiscaisAnalitico_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
        dataSource: {
            data: dsGrid,
            pageSize: 10,
            sort: {
                field: "DocNum",
                dir: "asc"
            },
            schema: {
                model: {
                    fields: {
                        DLcto: { type: "date" }
                    }
                }
            }
        },
        scrollable: true,
        sortable: true,
        pageable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            { field: "DocNum", title: "DocNum", width: "120px" },
            { field: "Movimento", title: "Movimento", width: "120px" },
            { field: "NumeroSerie", title: "Nota Fiscal", width: "120px" },
            { field: "CategoriaNF", title: "Categoria", width: "180px" },
            { field: "DLcto", title: "Data Lançamento", template: "#= kendo.toString(kendo.parseDate(DLcto, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "120px" },
            { field: "CodigoParticipante", title: "Cód. participante", width: "120px" },
            { field: "CFOP", title: "CFOP", width: "120px" },
            { field: "CFOPRef", title: "CFOP Referência", width: "120px" },
            { field: "Material", title: "Cód. Material", width: "120px" },
            { field: "DescricaoMaterial", title: "Desc. Material", width: "120px" },
            { field: "GrupoMercadoria", title: "Grupo de Material", width: "120px" },
            { field: "CodigoIVA", title: "Código do IVA", width: "120px" },
            { field: "TotalItem", title: "Total do Item", width: "120px", template: '#=TotalItem.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "BaseCalculoPIS", title: "Base de PIS", width: "120px", template: '#=BaseCalculoPIS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "ValorPIS", title: "Valor de PIS", width: "120px", template: '#=ValorPIS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "BaseCalculoCOFINS", title: "Base de COFINS", width: "120px", template: '#=BaseCalculoCOFINS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "ValorCOFINS", title: "Valor de COFINS", width: "120px", template: '#=ValorCOFINS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "Centro", title: "Centro", width: "120px" },
            { field: "CodigoIVA", title: "Código do IVA", width: "120px" },
            { field: "Usuario", title: "Usuário", width: "120px" }
        ]
    }).data("kendoGrid");

    grid.thead.kendoTooltip({
        filter: "th",
        content: function (e) {
            var target = e.target;
            return $(target).text();
        }
    });
}

function CarregarDocumentosFiscaisRegraTotalizadora(dataItem) {
    $("#loading-page").show();

    $("#gridDocumentosFiscaisAnalitico").html("");

    var grid =
    $("#gridDocumentosFiscaisAnalitico").kendoGrid({
        dataSource: {
            serverPaging: true,
            schema: {
                data: function (result) {
                    return result.Data;
                },
                total: function (result) {
                    return result.Total;
                } 
            },
            pageSize: 10,
            transport: {
                read: {
                    url: "/Relatorios/BuscarDocumentosFiscaisTotalizador",
                    dataType: "json",
                    type: "GET",
                    async: false,
                    cache: false
                },
                parameterMap: function (data, type) {                    
                    if (type == "read") {
                        var Ordernar = '';
                        var ordernarDir = '';

                        if (typeof data.sort !== "undefined" && data.sort !== null) {
                            ordernar = data.sort[0]['field'];
                            ordernarDir = data.sort[0]['dir'];
                        }

                        return {
                            IdSumario: dataItem.IdSumario,
                            Agrupador: dataItem.Agrupador,
                            Agregador: dataItem.Agregador,
                            numeroPagina: data.page,
                            tamanhoPagina: data.take,
                            pular: data.skip,
                            linhasPagina: data.pageSize,
                            Ordernar: Ordernar,
                            ordernarDir: ordernarDir
                        }
                    }                  
                }
            }
        },
        scrollable: true,
        sortable: true,
        pageable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            { field: "DocNum", title: "DocNum", width: "120px" },
            { field: "Movimento", title: "Movimento", width: "120px" },
            { field: "NumeroSerie", title: "Nota Fiscal", width: "120px" },
            { field: "CategoriaNF", title: "Categoria", width: "180px" },
            { field: "DLcto", title: "Data Lançamento", template: "#= kendo.toString(kendo.parseDate(DLcto, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "120px" },
            { field: "CodigoParticipante", title: "Cód. participante", width: "120px" },
            { field: "CFOP", title: "CFOP", width: "120px" },
            { field: "CFOPRef", title: "CFOP Referência", width: "120px" },
            { field: "Material", title: "Cód. Material", width: "120px" },
            { field: "DescricaoMaterial", title: "Desc. Material", width: "120px" },
            { field: "GrupoMercadoria", title: "Grupo de Material", width: "120px" },
            { field: "CodigoIVA", title: "Código do IVA", width: "120px" },
            { field: "TotalItem", title: "Total do Item", width: "120px", template: '#=TotalItem.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "BaseCalculoPIS", title: "Base de PIS", width: "120px", template: '#=BaseCalculoPIS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "ValorPIS", title: "Valor de PIS", width: "120px", template: '#=ValorPIS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "BaseCalculoCOFINS", title: "Base de COFINS", width: "120px", template: '#=BaseCalculoCOFINS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "ValorCOFINS", title: "Valor de COFINS", width: "120px", template: '#=ValorCOFINS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "Centro", title: "Centro", width: "120px" },
            { field: "CodigoIVA", title: "Código do IVA", width: "120px" },
            { field: "Usuario", title: "Usuário", width: "120px" }
        ]
    }).data("kendoGrid");

    grid.thead.kendoTooltip({
        filter: "th",
        content: function (e) {
            var target = e.target;
            return $(target).text();
        }
    });

    $("#loading-page").hide();
}

function insertItem(idPanel) {
    $('#inserValue' + idPanel).show();
    $('#insertBtn' + idPanel).hide();
    $('#saveBtn' + idPanel).show();
    var items = $('#gridPanel' + idPanel).data("kendoGrid")._data;

    $("#txtBase" + idPanel).keyup(function (event) {
        var numTxt = $(this).val().replace(',', '.');
        if (numTxt == "")
            numTxt = 0

        var numDs = 0;
        for (var i in items) {
            numDs = numDs + items[i].Base;
        }
        var result = parseFloat(numTxt) + parseFloat(numDs);

        $('#lbSaldoBase' + idPanel).html(result.formatMoney(2, ',', '.'));
    });

    $("#txtPis" + idPanel).keyup(function (event) {
        var numTxt = $(this).val().replace(',', '.');
        if (numTxt == "")
            numTxt = 0

        var numDs = 0;
        for (var i in items) {
            numDs = numDs + items[i].Pis;
        }
        var result = parseFloat(numTxt) + parseFloat(numDs);

        $('#lbSaldoPis' + idPanel).html(result.formatMoney(2, ',', '.'));
    });

    $("#txtCofins" + idPanel).keyup(function (event) {
        var numTxt = $(this).val().replace(',', '.');
        if (numTxt == "")
            numTxt = 0

        var numDs = 0;
        for (var i in items) {
            numDs = numDs + items[i].Cofins;
        }
        var result = parseFloat(numTxt) + parseFloat(numDs);

        $('#lbSaldoCofins' + idPanel).html(result.formatMoney(2, ',', '.'));
    });
}

function saveItem(idPanel) {
    $('#insertBtn' + idPanel).show();
    $('#saveBtn' + idPanel).hide();
}

function placeholder(element) {
    return element.clone().addClass("placeholder");
}

function hint(element) {
    return element.clone().addClass("hint")
                .height(element.height())
                .width(element.width());
}

function dividirArray(array, cols) {
    var ret = [];
    if (cols == 1 || array.length === 1) {
        ret.push(array);
    } else {
        var size = Math.ceil(array.length / cols);
        for (var i = 0; i < cols; i++) {
            var start = i * size;
            ret.push(array.slice(start, start + size));
        }
    }
    return ret;
}
