var emailPortalOld = '';

function CarregaComponentes() {
    VerificarInscricaoUsuarioLogado();    

    $('#btnPesquisarClientes').click(function () {
        BuscarDadosGrid(this);
    });

    $('#btnLimparPequisa').click(function () {
        document.getElementById("txtCod").value = "";
        document.getElementById("txtCNPJ").value = "";
        document.getElementById("txtRazaoSocial").value = "";
        document.getElementById("txtNomeFantasia").value = "";

        BuscarDadosGrid();
    });

    $('#btnReenviar').click(function () {
        ReenviarEmail();
    });

    $('#txtCod').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtCNPJ').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtRazaoSocial').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });

    $('#txtNomeFantasia').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid();
        }
    });
}

function VerificarInscricaoUsuarioLogado() {
    $.ajax({
        url: "/Home/ObterInscricaoUsuarioLogado",
        type: "GET",
        async: false,
        dataType: "json",
        cache: true,
        success: function (result) {
            if (result == 0) {
                document.getElementById("lbInscricaoSelecionada").hidden = false;
                $('#btSelecionarInscricao').show();                
                ExibirPopUpInscricoes();
            }
            else {
                LoadDsGrid(result);
            }
        }
    });
}

function ExibirPopUpInscricoes() {
    $('#modalInscricoes').modal({ backdrop: 'static', keyboard: false });
    LoadDsInscricoes();
}

function SelecionarInscricao(arg) {
    var selected = $.map(this.select(), function (item) {
        return $(item).text();
    });

    if (selected.length > 0)
        $('#btnSelectAccount').removeAttr('disabled');
    else
        $('#btnSelectAccount').attr('disabled', 'disabled');
}

function SelecionarLinhaGridInscricao() {
    var entityGrid = $("#gridGroupAccount").data("kendoGrid");
    var selectedItem = entityGrid.dataItem(entityGrid.select());

    $('#modalInscricoes').modal('hide');    

    if (selectedItem != null) {
        $('#tbIdInscricao').val(selectedItem.Id);
        var inscricao = "Conta: " + selectedItem.Nome + " - Descrição: " + selectedItem.Descricao;
        $("#lbInscricaoSelecionada").text(inscricao);
        LoadDsGrid(selectedItem.Id);
    }
    else {
        ShowModalAlerta('Nenhuma Holding foi selecionada.');
        $("#lbInscricaoSelecionada").text("Favor selecionar uma Holding.");        
    }
}

function LoadDsGrid(idInscricao) {
    var datasource = undefined;

    $.ajax({
        url: "/Clientes/Pesquisar?idInscricao=" + idInscricao,
        type: "GET",
        dataType: "json",
        async: false,
        cache: false,
        success: function (result) {
            if (result.length > 0) {
                datasource = result;
                GridClientes(datasource);                
            }
            else {
                $("#grid").removeAttr("class");
                $("#grid").html("<p>Nenhum Cliente encontrado!</p>");
            }
        }
    });

    AutoComplete();
}

function GridClientes(ds) {
    $("#grid").html("");
    $("#grid").kendoGrid({
        dataSource: {
            data: ds,
            pageSize: 10,
            schema: {
                model: {
                    fields: {
                        Id: { type: "string" }
                    }
                }
            }
        },
        scrollable: true,
        sortable: true,
        resizable: true,
        groupable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        columns: [
            { field: "Id", title: "Código Cliente", width: "10%" },
            { field: "CNPJCPF", title: "CNPJ", width: "15%" },
            { field: "razaoSocial", title: "Razão Social", width: "30%" },
            { field: "nomeFantasia", title: "Nome Fantasia", width: "25%" },
            {
                title: " ",
                template: "<a onclick='javascript:{EditCliente(this, true);}' class='k-button'>"
                    + "<span class='glyphicon glyphicon glyphicon-search'></span></a>",
                width: "5%",
                filterable: false
            },
            {
                title: " ",
                template: "<a onclick='javascript:{EditCliente(this, false);}' class='k-button'>"
                    + "<span class='glyphicon glyphicon glyphicon-pencil'></span></a>",
                width: "5%",
                filterable: false
            }
        ]
    });
}

function AutoComplete() {
    var kgrid = $("#grid").data("kendoGrid");
    var dsOld = kgrid.dataSource.data();
    var dsCodCli = [];
    var dsCNPJ = [];
    var dsRazaoSocial = [];
    var dsNomeFantasia = [];

    // Grupos
    for (var i in dsOld) {
        if (dsCodCli.indexOf(dsOld[i].Id) == -1 && dsOld[i].Id != undefined) {
            dsCodCli.push("" + dsOld[i].Id + "");
        }
        if (dsCNPJ.indexOf(dsOld[i].CNPJCPF) == -1 && dsOld[i].CNPJCPF != undefined) {
            dsCNPJ.push("" + dsOld[i].CNPJCPF + "");
        }
        if (dsRazaoSocial.indexOf(dsOld[i].razaoSocial) == -1 && dsOld[i].razaoSocial != undefined) {
            dsRazaoSocial.push("" + dsOld[i].razaoSocial + "");
        }
        if (dsNomeFantasia.indexOf(dsOld[i].nomeFantasia) == -1 && dsOld[i].nomeFantasia != undefined) {
            dsNomeFantasia.push("" + dsOld[i].nomeFantasia + "");
        }
    }

    $("#txtCod").kendoAutoComplete({
        dataSource: dsCodCli,
        filter: "startswith",
        placeholder: "Código do Cliente"
    });
    $("#txtCNPJ").kendoAutoComplete({
        dataSource: dsCNPJ,
        filter: "startswith",
        placeholder: "CNPJ"
    });
    $("#txtRazaoSocial").kendoAutoComplete({
        dataSource: dsRazaoSocial,
        filter: "startswith",
        placeholder: "Razão Social"
    });
    $("#txtNomeFantasia").kendoAutoComplete({
        dataSource: dsNomeFantasia,
        filter: "startswith",
        placeholder: "Nome Fantasia"
    });
}

function EditCliente(e, locked) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);

    if (locked) {
        $("h4.modal-title").text("Visualizar Cliente");
        $('#btnSalvar').hide();
        $('#btnCancelar').hide();
        $('#btnEditar').show();
        $('#btnVoltar').show();
    }
    else {
        $("h4.modal-title").text("Editar Cliente");
        $('#btnSalvar').show();
        $('#btnEditar').hide();
        $('#btnCancelar').show();
        $('#btnVoltar').hide();
        emailPortalOld = dataItem.emailPortalDevolucoes;
    }

    $('#idTxt').val(dataItem.Id);
    $('#cnpjCpfTxt').val(dataItem.CNPJCPF);
    $('#razaoSocialtxt').val(dataItem.razaoSocial);
    $('#nomeFantasiaTxt').val(dataItem.nomeFantasia);
    $('#inscricaoEstTxt').val(dataItem.inscricaoEstadual);
    $('#inscricaoMunTxt').val(dataItem.inscricaoMunicipal);
    $('#enderecoTxt').val(dataItem.tipoLogradouro + " " + dataItem.Logradouro);
    $('#numTxt').val(dataItem.Numero);
    $('#complTxt').val(dataItem.Complemento);
    $('#bairroTxt').val(dataItem.Bairro);
    $('#ufTxt').val(dataItem.UF);
    $('#municipioTxt').val(dataItem.Cidade);
    $('#cepTxt').val(dataItem.CEP);
    $('#telTxt').val(dataItem.DDD + " " + dataItem.Telefone);
    $('#mailFasTxt').val(dataItem.Email);
    $('#mailPortalTxt').val(dataItem.emailPortalDevolucoes);
    document.getElementById('mailPortalTxt').readOnly = locked

    if (dataItem.habilitadoPortal == 1) {
        $("#lbReenvio").text("Cliente habilitado ");        
        if (dataItem.emailPortalDevolucoes != '') {
            $('#btnReenviar').removeAttr('disabled');
        }
        else {
            $('#btnReenviar').attr('disabled', 'disabled');
        }

        $('#mailPortalTxt').attr('disabled', 'disabled');       
    }
    else {
        $("#lbReenvio").text("Cliente não habilitado ");
        $('#btnReenviar').attr('disabled', 'disabled');
        if (locked == false)
            $('#mailPortalTxt').removeAttr('disabled');
    }

    $('#modalEditCliente').modal({ backdrop: 'static', keyboard: false });
}

function EditarVisualizacaoCliente() {    
    document.getElementById('mailPortalTxt').readOnly = false;

    emailPortalOld = $('#mailPortalTxt').val();

    $("h4.modal-title").text("Editar Cliente");
    $('#btnSalvar').show();
    $('#btnEditar').hide();
    $('#btnCancelar').show();
    $('#btnVoltar').hide();
}

function SalvarCliente() {
    $("#loading-page").show();
    var cnpj = $('#cnpjCpfTxt').val();
    var mail = $('#mailPortalTxt').val();
    
    if (mail != "") {
        $.ajax({
            url: "/Clientes/EditarCliente",
            type: "POST",                        
            async: false,
            data: { cnpj: cnpj, emailPortal: mail },
            success: function (result) {                
                if (result == "") {
                    $("#loading-page").hide();
                    $('#modalEditCliente').modal('hide');
                    ShowModalSucesso("Alterações efetuadas com Sucesso!");
                    $("#grid").html("");
                    var idInscricao = $('#tbIdInscricao').val();
                    LoadDsGrid(idInscricao);
                }
                else {
                    $("#loading-page").hide();
                    ShowModalAlerta(result);
                }
            }
        });
    }
    else {
        $("#loading-page").hide();
        ShowModalAlerta("Digite um E-Mail do Portal de Devoluções!");
    }
}

function VerificarCancelarEdicao()
{
    var dataHTML = "";

    // Verificar se alterou o e-mail do Portal
    if ($('#mailPortalTxt').val() != emailPortalOld) {
        // Se alterou
        dataHtml = '<div class="row">'
                   + '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">'
                       + 'As alterações serão perdidas. Deseja mesmo cancelar?'
                   + '</div>'
                 + '</div>';

        $('#modalCancelarEdicao').modal({ backdrop: 'static', keyboard: false });
        $('#modalCancelarEdicao .modal-dialog .modal-body').html("");
        $('#modalCancelarEdicao .modal-dialog .modal-body').html(dataHtml);
    }
    else
    {
        $('#modalCancelarEdicao').modal('hide');
        $('#modalEditCliente').modal('hide');
    }
}

function ReenviarEmail() {
    var mail = $('#mailPortalTxt').val();
  
    $.ajax({       
        contentType: "application/json",
        url: "/Clientes/ReenviarAcesso",
        type: "POST",
        async: true,
        dataType: "json",
        cache: false,
        data: JSON.stringify({ idusuario: '', emailCliente: mail }),
        success: function (result) {
            if (result.Sucesso)
                ShowModalSucesso(result.Msg);
            else
                ShowModalAlerta(result.Msg);
        }
    });      
}