/*Get data to fill grid data - Request grid creation/update*/
var objEmpresa;
var LinhaemBranco;
var dsNotasFiscais;
var dsLancamento;
var dsValoresTotais;
var dsValoresPIS;
var dsValoresCOFINS;

function LoadDsGrid(Empresa) {
    objEmpresa = Empresa;
    var idEmpresa = Empresa.idEmpresa;
    GridApuracoes(idEmpresa);
    setInterval(function () {
        $('#grid').data('kendoGrid').dataSource.read();
    }, 15000);
}

/*Grid creation/update*/
function GridApuracoes(idEmpresa) {
    $("#grid").html("");
    $("#grid").kendoGrid({
        dataSource: {
            transport: {
                read: {
                    url: "/Relatorios/BuscarRelatorios",
                    dataType: "json",
                    type: "GET",
                    async: false,
                    cache: false
                },
                parameterMap: function (data, type) {
                    if (type == "read") {
                        return { idEmpresa: idEmpresa }
                    }
                }
            },
            pageSize: 10,
            sort: {
                field: "AnoMes",
                dir: "desc"
            },
            schema: {
                data: function (result) {
                    return result.Content;
                },
                total: function (result) {
                    return result.Total;
                },
                model: {
                    id: "Id",
                    fields: {
                        IdEmpresa: { validation: { required: true } },
                        Editavel: { validation: { required: true } },
                        AnoMes: { type: "text", validation: { required: false } },
                        InicioValidacao: { type: "date", validation: { required: false } },
                        FinalValidacao: { type: "date", validation: { required: false } },
                        StatusId: { validation: { required: false } },
                        Status: { validation: { required: false } }
                    }
                }
            }
        },
        scrollable: true,
        sortable: true,
        resizable: true,
        groupable: false,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: "Id", hidden: true },
            { field: "StatusId", hidden: true },
            { field: "IdEmpresa", hidden: true },
            { field: "Editavel", hidden: true },
            { field: "MensagemErro", hidden: true },
            { field: "AnoMes", title: "Período" },
            { field: "Status", title: "Status", template: kendo.template($("#linkLogErroTemplate").html()) },
            { field: "InicioValidacao", title: "Data Início", template: "#= kendo.toString(kendo.parseDate(InicioValidacao, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #" },
            { field: "FinalValidacao", title: "Data Término", template: "#= kendo.toString(kendo.parseDate(FinalValidacao, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #" },
            {
                field: "StatusId",
                title: " ",
                width: "105px",
                filterable: false,
                template: "<button class='k-button' onclick='javascript:{ReprocessarPeriodo(this);}' #= (StatusId == 0 || StatusId == 1 || Editavel == 0) ? 'disabled' : '' #>Reprocessar</button>",
                attributes: { style: "text-align:center;" }
            },
            {
                title: "Conciliação Contábil",
                template: kendo.template($("#botaoRelatorioCruzamentoTemplate").html()),
                width: "140px",
                attributes: { style: "text-align:center;" },
                filterable: false
            },
            {
                title: "Analítico",
                template: kendo.template($("#botaoRelatorioAnaliticoTemplate").html()),
                width: "75px",
                attributes: { style: "text-align:center;" },
                filterable: false
            },
            {
                title: "Gerencial",
                template: kendo.template($("#botaoRelatorioGerencialTemplate").html()),
                width: "75px",
                attributes: { style: "text-align:center;" },
                filterable: false
            },
            {
                title: "Saldos",
                template: kendo.template($("#botaoRelatorioSaldosTemplate").html()),
                width: "75px",
                attributes: { style: "text-align:center;" },
                filterable: false
            }
        ]
    });
}

function ExibirErroApuracao(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);

    dataHtml = 'Mensagem de Erro:<br><strong>' + dataItem.MensagemErro + '</strong>';

    $('#modalErroApuracao').modal({ backdrop: 'static', keyboard: false });
    $('#modalErroApuracao .modal-dialog .modal-body').html(dataHtml);
}

/*Marcar período para ser apurado novamente*/
function ReprocessarPeriodo(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var idApuracao = dataItem.Id;
    var idEmpresa = dataItem.IdEmpresa;

    $.ajax({
        url: "/Relatorios/ReprocessarPeriodo?idApuracao=" + idApuracao + "&idEmpresa=" + idEmpresa,
        type: "POST",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso) {
                ShowModalSucesso(result.Msg);
                LoadDsGrid(objEmpresa);
            }
            else
                ShowModalAlerta(result.Msg);
        }
    });

    $("#grid").data("kendoGrid").refresh();
}

/*Redirect to report detail for analysis*/
function AnalyticsDetails(e) {
    ////GetResultados(myId);
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    window.location = "/Relatorios/Analitico?idcontrole=" + dataItem.Id;
    //var myId = dataItem.Id;
    $.ajax({
        url: "/Relatorios/Analitico",
        data: JSON.stringify({ idcontrole: dataItem.Id }),
        contentType: 'application/json; charset=utf-8'
    });
}

function IsNull(conteudo, substituto) {
    if (conteudo == null) return substituto;
    else if (conteudo == "") return substituto;
    else if (conteudo == undefined) return substituto;
    else return conteudo;
}

/*Redirect to report detail for managers*/
function ManagerialDetails(e) {
    var objCred, objAjus, objRec, objdesp, objIsen, objDadosCabecalho;
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var msgErr = '';

    $.ajax({
        url: "/Gerencial/Gerar",
        data: JSON.stringify({ IdEmpresa: dataItem.IdEmpresa, AnoMes: dataItem.AnoMes }),
        type: 'POST',
        async: false,
        contentType: 'application/json; charset=utf-8',
        success: function (result) {

            if (result.Sucesso) {
                objDadosCabecalho = result.DadosCabecalhoDs;
                objCred = result.CreditoDs;
                objAjus = result.AjustesDS;
                objRec = result.ReceitasDS;
                objDesp = result.RecAPagarDS;
                objIsen = result.RecIsentasDS;
                objAliqDif = result.RecAliqDifDS;
                objrTot = result.RecTotalDS;
            }
            else {
                ShowModalAlerta(result.Msg);
                msgErr = result.Msg;
            }
        }
    });
    if (msgErr == '') {
        var repHtml, credHtml, ajusHtml, recHtml, rTotHtml, despHtml, isenHtml, Cabec, mClass;

        LinhaemBranco = "<tr style='line-height: 8px;'><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>";

        Cabec = "<body>";
        Cabec += "<div id='divGerencial' style='align:center;width:100%;'>";
        Cabec += "<table style='width:100%;'>";
        Cabec += "<tr>";
        Cabec += "<td style='text-align:left;font-size:10px;font-family:Tahoma;color:black;width:33%;'>" + objDadosCabecalho.RazaoSocial + "</td>";
        Cabec += "<td style='text-align:center;width:34%;'><strong>" + objDadosCabecalho.NomeRelatorio + "</strong></td>";
        Cabec += "<td style='width:33%;text-align:right;' rowspan=2><div id='imageTela' style='display:block;'><img src='../Content/images/layout/" + objDadosCabecalho.Logotipo + "' align='right'></div></td>";        
        Cabec += "</tr>";
        Cabec += "<tr>";
        Cabec += "<td style='text-align:left;font-size:10px;font-family:Tahoma;color:black;width:33%;'>" + objDadosCabecalho.CNPJ + "</td>";
        Cabec += "<td style='text-align:center;width:34%;'><strong>" + objDadosCabecalho.PeriodoGerado + "</strong></td>";
        Cabec += "<td style='width:33%;text-align:right;'></td>"
        Cabec += "</tr>";
        Cabec += "</table>";
        //Cabec += "<p>"        

        credHtml = Creditos(objCred);
        ajusHtml = Ajustes(objAjus);
        AlqDHtml = RecAliqDif(objAliqDif);
        recHtml = Receitas(objRec);
        despHtml = Despesas(objDesp);
        isenHtml = Isentas(objIsen);
        rTotHtml = ReceitasTotal(objrTot);

        repHtml = "<!DOCTYPE html>";

        repHtml += '<html>';
        repHtml += "<head>";
        repHtml += "<style>";
        repHtml += ".Largura-Linha {width:100%;}"
        repHtml += ".Largura-Linha-Titulo {width:100%;}"
        repHtml += ".Largura-Linha-Valor {width:100%;}"
        repHtml += ".Credito-Totalizador {border-bottom:1px solid black;border-top:1px solid black;font-weight:bold;}";
        repHtml += ".Credito-Normal {font-weight: normal;}";
        repHtml += ".Text-Rel {font-family:Tahoma;font-size:8px;text-align:left;}";
        repHtml += ".Val-Rel {font-family:Tahoma;font-size:8px;text-align:right;}";
        repHtml += ".Ger-Lin {line-height:11px;border-bottom: 1px solid black;border-top:1px solid black;}";
        repHtml += ".Ger-Bold {font-weight:bold;}";
        repHtml += ".Ger-font{font-family:Tahoma;font-size:8px;color:black;}";
        repHtml += ".SubTit-Rel {font-family:Tahoma;font-size:8px;background-color:black;color:white;font-weight:bold;text-align:right;}";
        repHtml += ".SubTitN-Rel {font-family:Tahoma;font-size:8px;background-color:white;color:black;font-weight:bold;text-align:right;}";
        repHtml += "</style>";
        repHtml += "</head>";

        repHtml += Cabec + credHtml + ajusHtml + AlqDHtml + LinhaemBranco;
        repHtml += recHtml + despHtml + isenHtml;
        repHtml += rTotHtml + '</div></body></html>';

        $('#modalGerencial2').modal({ backdrop: 'static', keyboard: false });
        $('#modalGerencial2 .modal-dialog .modal-body .body-message').html('Relatório Gerencial');
        $('#modalGerencial2 .modal-dialog .modal-body .body-message').html(repHtml);
    }
}

function Creditos(objCred) {
    var mClass, varHtml, LinhaemBranco, TemLinha;

    LinhaemBranco = "<tr style='line-height: 8px;'><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>";

    varHtml = '';

    varHtml += "<div style='page-break-after: always'>";

    varHtml += "<table>";
    varHtml += "<tr style='font-family:Tahoma;font-size: 9px;color:black;font-weight:bold'>";
    varHtml += "<th width='10%'  class='Text-Rel' style='border-bottom: 1px solid black;' >SPED</th>";
    varHtml += "<th width='10%'  class='Text-Rel' style='border-bottom: 1px solid black;'>Base</th>";
    varHtml += "<th width='20%' class='Text-Rel' style='border-bottom: 1px solid black;'>Descrição</th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Base</th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Pis</th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Cofins</th>";

    //if (VerificarExibicaoRateio(objCred)) {
        varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Tributada no<br>Mercado Interno</br></th>";
        varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Não tributada no Mercado Interno</th>";
        varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>de Exportação</th>";
    //}

    varHtml += "</tr>" + LinhaemBranco

   // if (VerificarExibicaoRateio(objCred)) {
        varHtml += "<tr><td class='SubTitN-Rel Ger-font' >   </td>";
        varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
        varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
        varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
        varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
        varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
        varHtml += "<td class='SubTit-Rel Ger-font' style='text-align:left' >Créditos</td>";
        varHtml += "<td class='SubTit-Rel Ger-font' ></td>";
        varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
        varHtml += "<td class='SubTit-Rel Ger-font' >   </td></tr>";
    //}
    //else {
    //    varHtml += "<tr><td class='SubTitN-Rel Ger-font'></td>";
    //    varHtml += "<td class='SubTitN-Rel Ger-font'></td>";
    //    varHtml += "<td class='SubTitN-Rel Ger-font'></td>";
    //    varHtml += "<td class='SubTit-Rel Ger-font'></td>";
    //    varHtml += "<td class='SubTit-Rel Ger-font' style='text-align:right'>Créditos</td>";
    //    varHtml += "<td class='SubTit-Rel Ger-font'></td>";
    //    varHtml += "</tr>"
    //}

    varHtml += LinhaemBranco;
    varHtml += "<tr><td class=' ' >   </td>";
    varHtml += "<td class=' ' >   </td>";
    varHtml += "<td class=' ' >   </td>";
    varHtml += "<td class=' ' ></td>";
    varHtml += "<td class=' ' > </td>";
    varHtml += "<td class=' ' > </td>";

   // if (VerificarExibicaoRateio(objCred)) {
        varHtml += "<td class='Ger-font Val-Rel' >" + objCred[0].pTribMI + "%</td>";
        varHtml += "<td class='Ger-font Val-Rel' >" + objCred[0].pNTribMI + "%</td>";
        varHtml += "<td class='Ger-font Val-Rel' >" + objCred[0].pNTribEx + "%</td>";
        varHtml += "<td class='' > </td></tr>";
    //}
    //else {
    //    varHtml += "<td class='Ger-font Val-Rel'>    </td>";
    //    varHtml += "<td class='Ger-font Val-Rel'>    </td>";
    //    varHtml += "<td class='Ger-font Val-Rel'>    </td>";
    //    varHtml += "<td class=''>    </td></tr>";
    //}

    TemLinha = 0;

    for (var i in objCred) {
        if (objCred[i].Totalizador == -1) {
            //if (VerificarExibicaoRateio(objCred)) {
                mClass = 'Credito-Totalizador';
                varHtml += '<tr class="Credito-Totalizador">';
            //}
            //else {
            //    mClass = 'Ger-Lin';             
            //}
        }
        else if (objCred[i].LinhasEspacadas == 1) {
            mClass = 'Ger-Lin';
            if (TemLinha > 0) {
                varHtml += '<tr>';
            }
            else {
                varHtml += LinhaemBranco + '<tr>';
            }
        }
        else {
            mClass = 'Credito-Normal';
            varHtml += '<tr>';
        }

        TemLinha = 0;

        varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + IsNull(objCred[i].Linha, '          ') + ' </td>';
        varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + IsNull(objCred[i].SPED, '          ') + '</td>';
        varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + objCred[i].Descricao + '</td>';
        varHtml += "<td class='" + mClass + " Ger-font Val-Rel' >" + objCred[i].Base.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Ger-font Val-Rel' >" + objCred[i].Pis.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  >" + objCred[i].Cofins.formatMoney(2, ',', '.') + '</td>';

       // if (objCred[i].Rateio) {
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  >" + objCred[i].TribMI.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel' >" + objCred[i].NTribMI.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  >" + objCred[i].NTribEx.formatMoney(2, ',', '.') + '</td>';
       // }
        //else {
        //    varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  >0,00</td>";
        //    varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  >0,00</td>";
        //    varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  >0,00</td>";
        //}

        if (objCred[i].LinhasEspacadas == 1 || objCred[i].Totalizador == -1) {
            mClass = 'Ger-Lin';
            varHtml += '</tr>' + LinhaemBranco;
            TemLinha = 1;
        }
        else {
            varHtml += '</tr>';
        }
    }

    varHtml += '</table>';
    varHtml += '</div>';

    return varHtml;
}

function VerificarExibicaoRateio(objCred) {
    for (var i in objCred) {
        if (objCred[i].Rateio)
            return true;
    }

    return false;
}

function Ajustes(objAjus) {
    var mClass, varHtml, LinhaemBranco, mTipo;
    var controleQuebraPagina = 0;
    varHtml = '';

    varHtml += "<div style='page-break-after: always'>";

    varHtml += "<table>";
    varHtml += "<tr style='font-family:Tahoma;font-size: 9px;color:black;font-weight:bold'>";
    varHtml += "<th width='10%'  class='Text-Rel' style='border-bottom: 1px solid black;' >SPED</th>";
    varHtml += "<th width='10%'  class='Text-Rel' style='border-bottom: 1px solid black;'>Base</th>";
    varHtml += "<th width='20%' class='Text-Rel' style='border-bottom: 1px solid black;'>Descrição</th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Base</th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Pis</th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Cofins</th>";    
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Tributada no<br>Mercado Interno</br></th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>Não tributada no Mercado Interno</th>";
    varHtml += "<th width='10%' class='Val-Rel' style='border-bottom: 1px solid black;'>de Exportação</th>";   

    varHtml += "</tr>";

    varHtml += "<tr><td> </td> <td class='Ger-Ajus-2 Ger-font Val-Rel'> </td>";
    varHtml += "<td class='Ger-Ajus-2 Ger-font Val-Text'> <span style='padding-left:5px'> </span></td></tr>"
    LinhaemBranco = "<tr style='line-height: 8px;'><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>";
    mTipo = 1;

    for (var i in objAjus) {
        if (objAjus[i].Tipo != mTipo && mTipo < 5) {
            mClass = 'Ger-Lin';
            varHtml += '</tr>' + LinhaemBranco;
            TemLinha = 1;
            mTipo = objAjus[i].Tipo
        }

        if (objAjus[i].Tipo == 1) {
            mClass = 'Ger-Lin';
            varHtml = varHtml + '<tr>';
        }
        else {
            mClass = 'Ger-Bold';
            varHtml = varHtml + '<tr>';
        }

        if (objAjus[i].Tipo == 1) {            
            varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + IsNull(objAjus[i].Linha, '          ') + ' </td>';
            varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + IsNull(objAjus[i].SPED, '          ') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + objAjus[i].Descricao + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel' >" + objAjus[i].Base.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel' >" + objAjus[i].Pis.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  >" + objAjus[i].Cofins.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel Ger-Lin' >" + objAjus[i].TribMI.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel Ger-Lin' >" + objAjus[i].NTribMI.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel Ger-Lin' >" + objAjus[i].NTribEx.formatMoney(2, ',', '.') + '</td>';       
        }
        else {
            if (controleQuebraPagina == 0)
            {
                varHtml += '</tr>' + LinhaemBranco + LinhaemBranco + '<tr>';
                controleQuebraPagina = 1;
            }               

            varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + IsNull(objAjus[i].Linha, '          ') + ' </td>';
            varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + IsNull(objAjus[i].SPED, '          ') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Text-Rel'>" + objAjus[i].Descricao + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel' ></td>";
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel' ></td>";
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel'  ></td>";
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel Ger-Lin' >" + objAjus[i].TribMI.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel Ger-Lin' >" + objAjus[i].NTribMI.formatMoney(2, ',', '.') + '</td>';
            varHtml += "<td class='" + mClass + " Ger-font Val-Rel Ger-Lin' >" + objAjus[i].NTribEx.formatMoney(2, ',', '.') + '</td>';
        }
     
        varHtml += '</tr>';
    }

    varHtml += '</table>';    
    varHtml += '</div>';

    return varHtml;
}

function RecAliqDif(objRec) {
    var mClass, varHtml, LinhaemBranco;
    varHtml = '';
    LinhaemBranco = "<tr style='line-height: 8px;'><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>";

    varHtml = "<table style='width:100%'>"
    varHtml += "<tr style='width:100%'>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "<th  width='20%'></th>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "<th  width='10%'></th>";
    varHtml += "</tr>";

    varHtml += LinhaemBranco;

    varHtml += "<tr style='width:100%'><td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' style='text-align:left' >Débitos</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' > </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td></tr>";
    varHtml += LinhaemBranco;
    varHtml += "<tr style='width:100%'><td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Base Cálculo</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >PIS - 0,65%</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Cofins - 4,00%</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Despesa PIS COFINS </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' style='text-align:left;padding-left:5px;' ></td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td></tr>";
    varHtml += LinhaemBranco;

    for (var i in objRec) {
        mClass = 'Ger-font';
        varHtml = varHtml + "<tr style='width:100%'>";

        if (objRec[i].Linhas == 1) {
            mClass += ' Ger-Lin';
        }
        if (objRec[i].Bold == 1) {
            mClass += ' Ger-Bold';
        }
        if (objRec[i].TotalPisCofins == 1) {
            mClass += ' Ger-Bold';
        }

        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objRec[i].Linha, '          ') + ' </td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objRec[i].SPED, '          ') + '</td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + objRec[i].Descricao + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objRec[i].Base.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objRec[i].Pis.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel'  >" + objRec[i].Cofins.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' >" + (objRec[i].Pis + objRec[i].Cofins).formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' ></td>";
        varHtml += "<td class='" + mClass + " Val-Rel ' ></td>";
        varHtml += "</tr>"
    }

    return varHtml;
}

function Receitas(objRec) {
    var mClass, varHtml;
    varHtml = '';

    varHtml = "<table style='width:100%'>"
    varHtml += "<tr style='width:100%'>"
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='20%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>"
    varHtml += "</tr>";

    varHtml += "<tr style='width:100%'><td class='SubTitN-Rel Ger-font'>   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Base Cálculo</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >PIS - 1,65%</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Cofins - 7,60%</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Despesa PIS COFINS </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' style='text-align:left;padding-left:5px;' ></td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td></tr>";

    varHtml += LinhaemBranco;

    for (var i in objRec) {
        mClass = 'Ger-font';

        if (objRec[i].Descricao == 'TOTAL DOS DÉBITOS') {
            varHtml += LinhaemBranco;
            //varHtml += LinhaemBranco;
        }

        varHtml = varHtml + "<tr style='width:100%'>";

        if (objRec[i].Linhas == 1) {
            mClass += ' Ger-Lin';
        }
        if (objRec[i].Bold == 1) {
            mClass += ' Ger-Bold';
        }
        if (objRec[i].TotalPisCofins == 1) {
            mClass += ' Ger-Bold';
        }

        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objRec[i].Linha, '          ') + ' </td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objRec[i].SPED, '          ') + '</td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + objRec[i].Descricao + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objRec[i].Base.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objRec[i].Pis.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel'  >" + objRec[i].Cofins.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' >" + (objRec[i].Pis + objRec[i].Cofins).formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' ></td>";
        varHtml += "<td class='" + mClass + " Val-Rel ' ></td>";
        varHtml += "</tr>"

        if (objRec[i].Descricao == 'Receita de Venda de bens e Serviços') // || objRec[i].Descricao == 'TOTAL DOS DÉBITOS')
            varHtml += LinhaemBranco;
    }

    return varHtml;
}

function Despesas(objDesp) {
    var mClass, varHtml;

    varHtml = "<table style='width:100%'>"
    varHtml += "<tr style='width:100%'>"
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='20%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>"
    varHtml += "</tr>";

    varHtml += "<tr style='width:100%'><td class='SubTitN-Rel Ger-font'>   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Despesas à Pagar</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' style='text-align:left;padding-left:5px;'>ou Crédito a Restituir</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td></tr>";

    varHtml += LinhaemBranco;

    for (var i in objDesp) {
        mClass = 'Ger-font';
        varHtml = varHtml + '<tr>';

        if (objDesp[i].Linhas == 1) {
            mClass += ' Ger-Lin';
        }
        if (objDesp[i].Bold == 1) {
            mClass += ' Ger-Bold';
        }
        if (objDesp[i].TotalPisCofins == 1) {
            mClass += ' Ger-Bold';
        }

        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objDesp[i].Linha, '          ') + ' </td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objDesp[i].SPED, '          ') + '</td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + objDesp[i].Descricao + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' >" + objDesp[i].NTribEx.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objDesp[i].Pis.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objDesp[i].Cofins.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel'  >" + (objDesp[i].Pis + objDesp[i].Cofins).formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' >" + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' >" + '</td>';
        varHtml += "</tr>"
    }

    varHtml += '</table>';

    return varHtml;
}

function Isentas(objIsen) {
    var mClass, varHtml;

    varHtml = ""

    varHtml = "<table style='width:100%'>"
    varHtml += "<tr style='width:100%'>"
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='20%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>"
    varHtml += "</tr>";

    varHtml += "<tr style='width:100%'><td class='SubTitN-Rel Ger-font'>   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTitN-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >Receitas Isentas</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' style='text-align:left;padding-left:5px;'>Não Tributáveis</td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td>";
    varHtml += "<td class='SubTit-Rel Ger-font' >   </td></tr>";

    varHtml += LinhaemBranco;

    for (var i in objIsen) {
        mClass = 'Ger-font';
        varHtml = varHtml + '<tr>';

        if (objIsen[i].Linhas != 0) {
            mClass += ' Ger-Lin';
        }
        if (objIsen[i].Bold != 0) {
            mClass += ' Ger-Bold';
        }
        if (objIsen[i].TotalPisCofins != 0) {
            mClass += ' Ger-Bold';
        }

        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objIsen[i].Linha, '          ') + ' </td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objIsen[i].SPED, '          ') + '</td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + objIsen[i].Descricao + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objIsen[i].Base.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' >" + objIsen[i].Pis.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel'  >" + objIsen[i].Cofins.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' >" + objIsen[i].TribMI.formatMoney(2, ',', '.') + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel ' ></td>";
        varHtml += "<td class='" + mClass + " Val-Rel ' ></td>";
        varHtml += "</tr>"

        if (objIsen[i].Linha.substring(0, 5) == 'Linha')
            varHtml += LinhaemBranco;
    }

    varHtml += '</table>';

    return varHtml;
}

function ReceitasTotal(objTot) {
    var mClass, varHtml;

    varHtml = ""

    varHtml += "<table style='width:100%'>"
    varHtml += "<tr style='width:100%'>"
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='20%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>";
    varHtml += "<th width='10%'></th>"
    varHtml += "</tr>";

    varHtml += "<tr style='width:100%'><td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td style='border-bottom: 1px solid black;' >   </td>";
    varHtml += "<td style='border-bottom: 1px solid black;' >   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td></tr>";

    for (var i in objTot) {
        mClass = 'Ger-font';
        varHtml = varHtml + '<tr>';

        if (objTot[i].Linhas != 0) {
            mClass += ' Ger-Lin';
        }
        if (objTot[i].Bold != 0) {
            mClass += ' Ger-Bold';
        }
        if (objTot[i].TotalPisCofins != 0) {
            mClass += ' Ger-Bold';
        }

        varHtml += "<td class='" + mClass + " Text-Rel'   >" + IsNull(objTot[i].Linha, '          ') + ' </td>';
        varHtml += "<td class='" + mClass + " Text-Rel'>" + IsNull(objTot[i].SPED, '          ') + '</td>';
        varHtml += "<td class='" + mClass + " Text-Rel'  style='border-left: 1px solid black;'>" + objTot[i].Descricao + '</td>';
        varHtml += "<td class='" + mClass + " Val-Rel' style='border-right: 1px solid black;' >" + objTot[i].Base.formatMoney(2, ',', '.') + '</td>';

        varHtml += "</tr>"
    }

    varHtml += "<tr style='width:100%'><td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td style='border-top: 1px solid black;'>   </td>";
    varHtml += "<td style='border-top: 1px solid black;' >   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td>";
    varHtml += "<td>   </td></tr>";

    varHtml += '</table>';

    return varHtml;
}

/*Redirect to report detail for balance*/
function BalanceDetails(e) {
    var objCreditoAcumulado, objResumoCredito, objSaldoCredito, objDadosCabecalho;
    var htmlCreditoAcumulado, htmlResumoCredito, htmlSaldoCredito;
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var CabecSaldo, CabecSaldoImprimir, repHtmlSaldo, repHtmlSaldoImprimir

    $.ajax({
        url: "/Relatorios/EmitirRelatorioSaldo?IdEmpresa=" + dataItem.IdEmpresa + "&AnoMes=" + dataItem.AnoMes,
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso) {
                objCreditoAcumulado = result.CreditoAcumulado;
                objResumoCredito = result.ResumoCredito;
                objSaldoCredito = result.SaldoCredito;
                objDadosCabecalho = result.DadosCabecalho;
            }
            else {
                ShowModalAlerta(result.Msg);
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            var erro = xhr;
        }
    });

    CabecSaldo = "<body>";

    CabecSaldo += "<div id='divSaldo' class='Largura-Linha' style='align:center'>";

    CabecSaldo += "<table class='Largura-Linha'>";
    CabecSaldo += "<tr class='Largura-Linha'>";
    CabecSaldo += "<td style='text-align:left;font-size:10px;font-family:Tahoma;color:black;width:33%;'>" + objDadosCabecalho.RazaoSocial + "</td>";
    CabecSaldo += "<td style='text-align:center;width:34%;'><strong>Saldos de Apuração de PIS / Cofins</strong></td>";
    CabecSaldo += "<td style='width:33%;text-align:right;' rowspan=2><div id='imageTela' style='display:block;'><img src='../Content/images/layout/" + objDadosCabecalho.Logotipo + "' align='right'></div></td>";

    CabecSaldo += "</tr>";
    CabecSaldo += "<tr class='Largura-Linha'>";
    CabecSaldo += "<td style='text-align:left;font-size:10px;font-family:Tahoma;color:black;width:33%;'>" + objDadosCabecalho.CNPJ + "</td>";
    CabecSaldo += "<td style='text-align:center;width:34%;'><strong>" + objDadosCabecalho.PeriodoGerado + "</strong></td>";
    CabecSaldo += "</tr>";
    CabecSaldo += "</table>";

    htmlResumoCredito = ResumoCredito(objResumoCredito);
    htmlCreditoAcumulado = CreditoAcumulado(objCreditoAcumulado);
    htmlSaldoCredito = SaldoCredito(objSaldoCredito);

    repHtmlSaldo = "<!DOCTYPE html>";
    repHtmlSaldo += "<html>";
    repHtmlSaldo += "<head>";
    repHtmlSaldo += "<style>";
    repHtmlSaldo += ".Largura-Linha {width:100%;}"
    repHtmlSaldo += ".Largura-Linha-Titulo {width:500px;}"
    repHtmlSaldo += ".Largura-Linha-Valor {width:100px;}"
    repHtmlSaldo += ".Credito-Totalizador {border-bottom:1px solid black;border-top:1px solid black;font-weight:bold;}";
    repHtmlSaldo += ".Credito-Normal {font-weight: normal;}";
    repHtmlSaldo += ".Text-Rel {text-align:left;}";
    repHtmlSaldo += ".Val-Rel {text-align:right;}";
    repHtmlSaldo += ".Ger-Lin {line-height:11px;border-bottom: 1px solid black;border-top:1px solid black;}";
    repHtmlSaldo += ".Ger-Bold {font-weight:bold;}";
    repHtmlSaldo += ".Ger-font{font-family:Tahoma;font-size:10px;color:black;}";
    repHtmlSaldo += ".SubTit-Rel {background-color:black;color:white;font-weight:bold;text-align:right;}";
    repHtmlSaldo += ".SubTitN-Rel {background-color:white;color:black;font-weight:bold;text-align:right;}";
    repHtmlSaldo += "</style>";
    repHtmlSaldo += "</head>";

    //repHtmlSaldo += CabecSaldo + "<table class='Largura-Linha' style='border-collapse:collapse;'>" + htmlResumoCredito + htmlCreditoAcumulado + htmlSaldoCredito + '</table></div></body></html>';

    repHtmlSaldo += CabecSaldo + htmlResumoCredito + htmlCreditoAcumulado + htmlSaldoCredito + '</div></body></html>';

    $('#modalSaldo').modal({ backdrop: 'static', keyboard: false });
    $('#modalSaldo .modal-dialog .modal-body .body-message').html(repHtmlSaldo);
}

function ResumoCredito(objResumoCredito) {
    var LinhaemBrancoSaldo, LinhaemBrancoComTracoSaldo, varHtml, obj;

    obj = 0.00;

    LinhaemBrancoSaldo = "<tr class='Largura-linha' style='line-height:9px;'><td colspan='3'>&nbsp;</td></tr>";

    LinhaemBrancoComTracoSaldo = "<tr classe='Largura-Linha' style='line-height:9px;border-bottom:1px solid black;'><td colspan='3'>&nbsp;</td></tr>";

    varHtml = "";

    varHtml += "<div style='page-break-after: always'>";

    varHtml += "<table class='Largura-Linha' style='border-collapse:collapse;'>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += "<tr class='Largura-Linha' style='font-family:Tahoma;font-size:10px;color:black;font-weight:bold;'>";
    varHtml += "<td style='background-color:black;color:white;font-weight:bold;text-align:center;line-height:11px;' colspan='3' class='SubTitN-Rel Ger-font Largura-Linha'>RESUMO CRÉDITOS E DÉBITOS DO PERÍODO</td>";
    varHtml += "</tr>";
    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Largura-Linha-Titulo'></td>";
    varHtml += "<td class='Ger-font Largura-Linha-Valor' style='text-align:center;font-weight:bold;'>PIS</td>";
    varHtml += "<td class='Ger-font Largura-Linha-Valor' style='text-align:center;font-weight:bold;'>COFINS</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Tributo Devido</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TributoDevidoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TributoDevidoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Retenção na Fonte</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.RetencaoFontePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.RetencaoFonteCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Tributo Devido Líquido de Retenção</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TributoDevidoLiquidoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TributoDevidoLiquidoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Créditos do Período de Apuração</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel' style='text-align:left;'>Crédito MI - vinculado a receita tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito MI - vinculado a receita NÃO tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaNaoTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaNaoTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito MI - vinculado a receita de exportação</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaExportacaoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaExportacaoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;font-weight:bold;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Total</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaTotalPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.MercadoInternoReceitaTotalCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito Importação - vinculado a receita tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito Importação - vinculado a receita NÃO tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaNaoTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaNaoTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito Importação - vinculado a receita de exportação</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaExportacaoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaExportacaoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;font-weight:bold;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Total</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaTotalPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.ImportacaoReceitaTotalCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;font-weight:bold;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>TOTAL Créditos do Mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TotalCreditosMesPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TotalCreditosMesCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += LinhaemBrancoSaldo;

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Créditos de Períodos Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito MI - vinculado a receita tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito MI - vinculado a receita NÃO tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaNaoTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaNaoTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito MI - vinculado a receita de exportação</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaExportacaoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaExportacaoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;font-weight:bold;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Total</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaTotalPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorMercadoInternoReceitaTotalCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito Importação - vinculado a receita tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito Importação - vinculado a receita NÃO tributada MI</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaNaoTributadaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaNaoTributadaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito Importação - vinculado a receita de exportação</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaExportacaoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaExportacaoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;font-weight:bold;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Total</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaTotalPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorImportacaoReceitaTotalCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;
    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;font-weight:bold;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>TOTAL Créditos de Períodos Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorTotalCreditosMesPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.AnteriorTotalCreditosMesCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoComTracoSaldo;

    varHtml += "<tr class='Largura-Linha' style='border-bottom:1px solid black;font-weight:bold;'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>TOTAL CRÉDITOS</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TotalCreditosPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objResumoCredito.TotalCreditosCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;

    varHtml += "</table>";

    varHtml += "</div>";

    return varHtml;
}

function CreditoAcumulado(objCreditoAcumulado) {
    var LinhaemBrancoSaldo, LinhaemBrancoComTracoSaldo, varHtml, obj;

    obj = 0.00;

    LinhaemBrancoSaldo = "<tr classe='Largura-Linha' style='line-height:9px;'><td colspan='3'>&nbsp;</td></tr>";

    LinhaemBrancoComTracoSaldo = "<tr classe='Largura-Linha' style='line-height:9px;border-bottom:1px solid black;'><td colspan='3'>&nbsp;</td></tr>";

    varHtml = "";

    varHtml += "<table class='Largura-Linha' style='border-collapse:collapse;'>";
    varHtml += "<tr class='Largura-Linha' style='font-family:Tahoma;font-size:10px;color:black;font-weight:bold;'>";
    varHtml += "<td class='SubTitN-Rel Ger-font Largura-Linha' style='background-color:black;color:white;font-weight:bold;text-align:center;line-height:11px;' colspan='3'>DEMONSTRAÇÃO DE UTILIZAÇÃO DE CRÉDITOS ACUMULADOS</td>";
    varHtml += "</tr>";
    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo'>  </td>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Valor' style='text-align:center;font-weight:bold;'>PIS</td>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Valor' style='text-align:center;font-weight:bold;'>COFINS</td>";
    varHtml += "</tr>";

    varHtml += Natureza101(objCreditoAcumulado);

    varHtml += LinhaemBrancoSaldo;

    varHtml += Natureza201(objCreditoAcumulado);

    varHtml += LinhaemBrancoSaldo;

    varHtml += Natureza301(objCreditoAcumulado);

    varHtml += LinhaemBrancoSaldo;

    varHtml += Natureza108(objCreditoAcumulado)

    varHtml += LinhaemBrancoSaldo;    

    varHtml += "</table>";

    varHtml += "<div style='page-break-after: always'>";

    varHtml += "<table class='Largura-Linha' style='border-collapse:collapse;'>";

    varHtml += Natureza208(objCreditoAcumulado)

    varHtml += "</div>";

    varHtml += "</table>";

    varHtml += LinhaemBrancoSaldo;

    varHtml += "<table class='Largura-Linha' style='border-collapse:collapse;'>";
    varHtml += Natureza308(objCreditoAcumulado)

    varHtml += "</table>";

    return varHtml;
}

function Natureza101(objCreditoAcumulado) {
    var varHtml;

    var obj = 0.00;

    varHtml = "<tr>";
    varHtml += "<td colspan='3'>";
    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito MI - Vinculado a receita tributada MI - Natureza 101</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito de Meses Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaSaldoCreditoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaSaldoCreditoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito objeto de pedido de ressarcimento no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Créditos Compensados no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCompensadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCompensadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Saldo de Crédito disponível de meses anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaSaldoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaSaldoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito apurado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCreditoApuradoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCreditoApuradoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito descontado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCreditoDescontadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCreditoDescontadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Remanescente</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCreditoRemanescentePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaTributadaCreditoRemanescenteCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";
    varHtml += "</td>";
    varHtml += "</tr>";

    return varHtml;
}

function Natureza201(objCreditoAcumulado) {
    var varHtml;

    var obj = 0.00;

    varHtml = "<tr>";
    varHtml += "<td colspan='3'>";

    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";
    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito MI - Vinculado a receita NÃO tributada MI - Natureza 201</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito de Meses Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaSaldoCreditoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaSaldoCreditoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito objeto de pedido de ressarcimento no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Créditos Compensados no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCompensadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCompensadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Saldo de Crédito disponível de meses anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaSaldoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaSaldoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito apurado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCreditoApuradoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCreditoApuradoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito descontado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCreditoDescontadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCreditoDescontadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Remanescente</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCreditoRemanescentePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaNaoTributadaCreditoRemanescenteCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";

    varHtml += "</td>";
    varHtml += "</tr>";

    return varHtml;
}

function Natureza301(objCreditoAcumulado) {
    var varHtml;

    var obj = 0.00;

    varHtml = "<tr>";
    varHtml += "<td colspan='3'>";
    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito MI - Vinculado a receita de exportação - Natureza 301</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito de Meses Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoSaldoCreditoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoSaldoCreditoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito objeto de pedido de ressarcimento no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Créditos Compensados no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCompensadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCompensadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Saldo de Crédito disponível de meses anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoSaldoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoSaldoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito apurado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCreditoApuradoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCreditoApuradoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito descontado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCreditoDescontadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCreditoDescontadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Remanescente</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCreditoRemanescentePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.MercadoInternoReceitaExportacaoCreditoRemanescenteCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";
    varHtml += "</td>";
    varHtml += "</tr>";

    return varHtml;
}

function Natureza108(objCreditoAcumulado) {
    var varHtml;

    var obj = 0.00;

    varHtml = "<tr class='Largura-Linha'>";
    varHtml += "<td colspan='3'>";
    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha' style='text-align:left;font-weight:bold;' colspan='3'>Crédito Importação - Vinculado a receita tributada MI - Natureza 108</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito de Meses Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaSaldoCreditoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaSaldoCreditoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito objeto de pedido de ressarcimento no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Créditos Compensados no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCompensadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCompensadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Saldo de Crédito disponível de meses anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaSaldoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaSaldoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito apurado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCreditoApuradoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCreditoApuradoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito descontado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCreditoDescontadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCreditoDescontadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Remanescente</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCreditoRemanescentePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoTributadaCreditoRemanescenteCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";
    varHtml += "</td>";
    varHtml += "</tr>";

    return varHtml;
}

function Natureza208(objCreditoAcumulado) {
    var varHtml;

    var obj = 0.00;

    varHtml = "<tr>";
    varHtml += "<td colspan='3'>";
    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Importação - Vinculado a receita NÃO tributada MI - Natureza 208</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito de Meses Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaSaldoCreditoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaSaldoCreditoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito objeto de pedido de ressarcimento no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Créditos Compensados no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCompensadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCompensadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Saldo de Crédito disponível de meses anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaSaldoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaSaldoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito apurado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCreditoApuradoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCreditoApuradoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito descontado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCreditoDescontadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCreditoDescontadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Remanescente</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCreditoRemanescentePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoNaoTributadaCreditoRemanescenteCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";
    varHtml += "</td>";
    varHtml += "</tr>";

    return varHtml;
}

function Natureza308(objCreditoAcumulado) {
    var varHtml;

    var obj = 0.00;

    varHtml = "<tr>";
    varHtml += "<td colspan='3'>";
    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";
    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Importação - Vinculado a receita de exportação - Natureza 308</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'></td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito de Meses Anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoSaldoCreditoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoSaldoCreditoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito objeto de pedido de ressarcimento no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Créditos Compensados no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCompensadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCompensadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Saldo de Crédito disponível de meses anteriores</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoSaldoAnteriorPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoSaldoAnteriorCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Crédito apurado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCreditoApuradoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCreditoApuradoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>(-) Crédito descontado no mês</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCreditoDescontadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCreditoDescontadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;font-weight:bold;'>Crédito Remanescente</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCreditoRemanescentePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objCreditoAcumulado.ImportacaoExportacaoCreditoRemanescenteCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";
    varHtml += "</td>";
    varHtml += "</tr>";

    return varHtml;
}

function SaldoCredito(objSaldoCredito) {
    var LinhaemBrancoSaldo, LinhaemBrancoComTracoSaldo, varHtml, obj;

    obj = 0.00;

    LinhaemBrancoSaldo = "<tr classe='Largura-Linha' style='line-height:9px;'><td colspan='3'>&nbsp;</td></tr>";

    LinhaemBrancoComTracoSaldo = "<tr classe='Largura-Linha' style='line-height:9px;border-bottom:1px solid black;'><td colspan='3'>&nbsp;</td></tr>";

    varHtml = LinhaemBrancoSaldo;

    varHtml += "<table class='Largura-Linha' style='border-collapse:collapse;'>";

    varHtml += "<tr classe='Largura-Linha' style='font-family:Tahoma;font-size:10px;color:black;font-weight:bold;'>";
    varHtml += "<td style='background-color:black;color:white;font-weight:bold;text-align:center;line-height:11px;' colspan='3' class='SubTitN-Rel Ger-font Largura-Linha'>Resumo Saldo dos Créditos</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo'></td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:center;font-weight:bold;'>PIS</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:center;font-weight:bold;'>COFINS</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td colspan='3'>";
    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Total Débito do Período</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.TotalDebitoPeriodoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.TotalDebitoPeriodoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Total Credito Utilizado</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.TotalCreditoUtilizadoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.TotalCreditoUtilizadoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>CHECK</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.CheckPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.CheckCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito - Sem pedido de ressarcimento</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.SaldoCreditoSemRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.SaldoCreditoSemRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo de Crédito - Com pedido de ressarcimento não compensado</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.SaldoCreditoComRessarcimentoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.SaldoCreditoComRessarcimentoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>Saldo Total de Créditos</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.SaldoTotalCreditoPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.SaldoTotalCreditoCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";
    varHtml += "</table>";
    varHtml += "</td>";
    varHtml += "</tr>";

    varHtml += LinhaemBrancoSaldo;

    varHtml += "<tr class='Largura-Linha'>";

    varHtml += "<td colspan='3'>";
    varHtml += "<table style='width:100%;border-bottom:2px solid black;border-top:2px solid black;border-left:2px solid black;border-right:2px solid black;'>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>CONTABILIDADE</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.ContabilidadePIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.ContabilidadeCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "<tr class='Largura-Linha'>";
    varHtml += "<td class='Ger-font Text-Rel Largura-Linha-Titulo' style='text-align:left;'>DIFERENÇA</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.DiferencaPIS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "<td class='Ger-font Val-Rel Largura-Linha-Valor' style='text-align:right;'>" + objSaldoCredito.DiferencaCOFINS.formatMoney(2, ',', '.') + "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";
    varHtml += "</td>";
    varHtml += "</tr>";

    varHtml += "</table>";

    return varHtml;
}

/*Get BusinessId*/
function GetObj() {
    var obj = [];

    var matrizList = $('#txtCodBusiness').data("kendoDropDownList");
    var idMatriz = matrizList.dataItem().Id;
    obj.push({
        idEmpresa: idMatriz
    });

    return obj;
}

function CarregarComponentes() {
    $('#btnIncluir').hide();

    CarregarMatrizes();
    //CarregarGridLancamentos();

    $('#btnPesquisar').click(function () {
        ManagerialDetails();
        //$('#btnIncluir').show();
    });

    $('#btnLimparPequisa').click(function () {
        var selectMatriz = $("#selectMatriz").data("kendoDropDownList");
        selectMatriz.select(0);
        $('#tbRazaoSocial').val('');
        $('#btnIncluir').hide();
        idMatriz = 0;
        // CarregarGridLancamentos(idMatriz);
    });

    $("#tabstrip").kendoTabStrip({
        animation: {
            open: {
                effects: "fade"
            }
        }
    });
}

function CarregarMatrizes() {
    var dsMatriz = undefined;
    $.ajax({
        url: "/Empresa/Pesquisar?idInscricao=1",
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            dsMatriz = result;
        }
    });

    if (dsMatriz == undefined) {
        ShowModalAlerta("Não foi possível obter as Matrizes.");
        return;
    }

    $('#selectMatriz').kendoDropDownList({
        dataTextField: "CodigoMatriz",
        dataValueField: "Id",
        dataSource: dsMatriz,
        optionLabel: "Escolha ...",
        select: function (e) {
            var dataItem = this.dataItem(e.item.index());
            $('#tbRazaoSocial').val(dataItem.RazaoSocial);
            idMatriz = dataItem.Id;
        }
    });
}

function ExibirRelatorioConciliacaoContabil(e) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var IdEmpresa = dataItem.IdEmpresa;
    var AnoMes = dataItem.AnoMes;   
    var dsHeader = [];

    $.ajax({
        url: "/Relatorios/EmitirRelatorioConciliacaoContabil?IdEmpresa=" + IdEmpresa + "&AnoMes=" + AnoMes,
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            if (result.Sucesso) {
                dsNotasFiscais = result.dsNotasFiscais;
                dsLancamento = result.dsLancamento;
                dsValoresTotais = result.dsValoresTotais;
                dsValoresPIS = result.dsValoresPIS;
                dsValoresCOFINS = result.dsValoresCOFINS;
            }
            else
                ShowModalAlerta(result.Msg);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            var erro = xhr;            
        }
    });    

    //if (dsNotasFiscais.length > 0)
        dsHeader.push({
            'Regra': '1', 'Descricao': 'Regra 1 - Documentos Fiscais não existentes em Lançamentos Contábeis'
        });

    //if (dsLancamento.length > 0)
        dsHeader.push({
            'Regra': '2', 'Descricao': 'Regra 2 - Lançamentos Contábeis não existentes em Documentos Fiscais'
        });

    //if (dsValoresTotais.length > 0)
        dsHeader.push({
            'Regra': '3', 'Descricao': 'Regra 3 - Diferença de Valor Total entre a Nota Fiscal e o Lançamento Contábil acima de R$ 0,01'
        });

    //if (dsValoresPIS.length > 0)
        //dsHeader.push({
        //    'Regra': '4', 'Descricao': 'Regra 4 - Diferença de Valor de PIS entre a Nota Fiscal e o Lançamento Contábil acima de R$ 0,01'
        //});

    //if (dsValoresCOFINS.length > 0)
        //dsHeader.push({
        //    'Regra': '5', 'Descricao': 'Regra 5 - Diferença de Valor de COFINS entre a Nota Fiscal e o Lançamento Contábil acima de R$ 0,01'
        //});

    //if (dsHeader.length == 0) {
    //    ShowModalSucesso('Não houveram divergências no cruzamento deste período.');
    //    return;
    //}   

    $("#gridHeaderCruzamento").html("");
    $("#gridHeaderCruzamento").kendoGrid({
        dataSource: {
            data: dsHeader
        },
        dataBound: function () {
            var grid = $("#gridHeaderCruzamento").data("kendoGrid");
            grid.select($("tr:first", grid.tbody));
        },
        change: SelecionarRegra,
        scrollable: true,
        selectable: true,
        sortable: false,
        groupable: false,
        resizable: true,
        cache: false,
        columns: [
            { field: "Regra", hidden: true },
            { field: "Descricao", title: "REGRA DE CRUZAMENTO", headerAttributes: { style: "text-align:center;font-weight:bold" } }
        ]
    });

    $('#modalCruzamentoNotas').modal({
        backdrop: 'static', keyboard: false
    });
}

function SelecionarRegra(arg, dsCruzamento) {
    var gridHeader = $("#gridHeaderCruzamento").data("kendoGrid");
    var linhaGrid = gridHeader.dataItem(gridHeader.select());

    CarregarDetalhesCruzamento(linhaGrid.Regra, dsCruzamento);
}

function CarregarDetalhesCruzamento(tipoRegra, dsCruzamento) {
    $("#gridDetalhesNotasFicais").html("");
    $("#gridDetalhesLancamentos").html("");
    $("#gridDetalhesValores").html("");

    switch (tipoRegra) {
        case "1":
            CarregarGridDetalhesNotasFiscais();
            break;
        case "2":
            CarregarGridDetalhesLancamentos();
            break;
        case "3":
            CarregarGridDetalhesValoresDivergentes(dsValoresTotais);
            break;
        case "4":
            CarregarGridDetalhesValoresDivergentes(dsValoresPIS);
            break;
        case "5":
            CarregarGridDetalhesValoresDivergentes(dsValoresCOFINS);
            break;
        default:
            ShowModalAlerta("Tipo de Regra inválida!");
            break;
    }
}

function CarregarGridDetalhesNotasFiscais() {
    $("#gridDetalhesNotasFicais").html("");
    $("#gridDetalhesNotasFicais").kendoGrid({
        toolbar: ["excel"],
        excel: {
            fileName: 'NotasConciliacao_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
        sortable: true,
        groupable: true,
        autoBind: true,
        resizable: true,
        pageable: true,
        cache: false,
        selectable: 'row',
        dataSource: {
            data: dsNotasFiscais,
            pageSize: 25
        },
        columns: [
            { field: "CodFilial", title: "Código da Filial", width: "120px" },
            { field: "DocNum", title: "DOCNUM", width: "120px" },
            { field: "Numero", title: "N° Nota Fiscal", width: "80px" },
            { field: "Serie", title: "Serie", width: "80px" },
            { field: "LeiCofins", title: "CST COFINS", width: "80px" },
            { field: "LeiTribPIS", title: "CST PIS", width: "80px" },
            { field: "DataEmissao", title: "Data Emissão", template: "#= kendo.toString(kendo.parseDate(DataEmissao, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "120px" },
            { field: "DataLancamento", title: "Data Lançamento", template: "#= kendo.toString(kendo.parseDate(DataLancamento, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "120px" },
            { field: "TotalItem", width: "120px", title: "Total Item", template: '#=TotalItem.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "ValorPIS", width: "120px", title: "Valor PIS", template: '#=ValorPIS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "ValorCOFINS", width: "120px", title: "Valor COFINS", template: '#=ValorCOFINS.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } }
        ]
    });
}

function CarregarGridDetalhesLancamentos() {
    $("#gridDetalhesLancamentos").html("");
    $("#gridDetalhesLancamentos").kendoGrid({
        toolbar: ["excel"],
        excel: {
            fileName: 'LancamentoConciliacao_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
        sortable: true,
        groupable: true,
        autoBind: true,
        resizable: true,
        pageable: true,
        cache: false,
        selectable: 'row',
        dataSource: {
            data: dsLancamento,
            pageSize: 25
        },
        columns: [
            { field: "ContaContabil", title: "Conta Contábil", width: "120px" },
            { field: "DescricaoContaContabil", title: "Descrição da Conta Contábil", width: "120px" },
            { field: "Referencia", title: "Referencia", width: "120px" },
            { field: "DataLancamento", title: "DataLancamento", template: "#= kendo.toString(kendo.parseDate(DataLancamento, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "120px" },
            { field: "Valor", width: "120px", title: "Valor", template: '#=Valor.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } }
        ]
    });
}

function CarregarGridDetalhesValoresDivergentes(ds) {
    $("#gridDetalhesValores").html("");
    $("#gridDetalhesValores").kendoGrid({
        toolbar: ["excel"],
        excel: {
            fileName: 'DivergenciaConciliacao_' + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1) + '.xlsx',
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
        sortable: true,
        groupable: true,
        autoBind: true,
        resizable: true,
        pageable: true,
        cache: false,
        selectable: 'row',
        dataSource: {
            data: ds,
            pageSize: 25
        },
        columns: [
            { field: "ContaContabil", title: "Conta Contábil", width: "120px" },
            { field: "DescricaoContaContabil", title: "Descrição da Conta Contábil", width: "120px" },
            { field: "Numero", title: "N° Nota Fiscal", width: "80px" },
            { field: "Serie", title: "Serie", width: "80px" },
            { field: "LeiCofins", title: "CST COFINS", width: "80px" },
            { field: "LeiTribPIS", title: "CST PIS", width: "80px" },
            { field: "DataEmissao", title: "Data Emissão", template: "#= kendo.toString(kendo.parseDate(DataEmissao, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "120px" },
            { field: "DataLancamento", title: "Data Lançamento", template: "#= kendo.toString(kendo.parseDate(DataLancamento, 'yyyy-MM-dd'), 'dd/MM/yyyy') #", width: "120px" },
            { field: "DocNum", title: "Nº Documento", width: "120px" },
            { field: "Valor", width: "120px", title: "Valor", template: '#=Valor.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "MontanteMI", width: "120px", title: "Montante MI", template: '#=MontanteMI.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } },
            { field: "Diferenca", width: "120px", title: "Diferença", template: '#=Diferenca.FormatarMoeda(2, "", ".", ",") #', attributes: { style: "text-align:right;" } }
        ]
    });
}
