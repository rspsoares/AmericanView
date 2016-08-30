var empresaOriginal = [];

function CarregaComponentes() {
    //LoadDsInscricoes();
    LoadDsGrid();

    $('#btnIncluirEmpresa').click(function () {
        IncluirEmpresa();
    });

    $('#btnPesquisarEmpresa').click(function () {
        BuscarDadosGrid();
    });

    $('#btnLimparPequisa').click(function () {
        var dropdownlist;

        document.getElementById("txtRazaoSocialFiltro").value = "";
        BuscarDadosGrid();
    });

    $('#txtRazaoSocialFiltro').keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            BuscarDadosGrid(this,"");
        }
    });
}

function AutoComplete() {
    var kgrid = $("#grid").data("kendoGrid");
    var dsOld = kgrid.dataSource.data();
    
    var dsRazaoSocial = [];

    //// Usuários
    for (var i in dsOld) {
        if (dsRazaoSocial.indexOf(dsOld[i].RazaoSocial) == -1 && dsOld[i].RazaoSocial != undefined) {
            dsRazaoSocial.push("" + dsOld[i].RazaoSocial + "");
        }
    }

    $("#txtRazaoSocialFiltro").kendoAutoComplete({
        dataSource: dsRazaoSocial,
        filter: "startswith",
        placeholder: "Razão Social"
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

function LoadDsGrid() {
    var datasource = undefined;
    $.ajax({
        url: "/Empresa/Pesquisar?idInscricao=1",
        type: "GET",
        async: false,
        dataType: "json",
        cache: false,
        success: function (result) {
            datasource = result;
            GridClientes(datasource);
        }
    });
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
             { field: "RazaoSocial", title: "Razão Social", width: "180px" },
             { field: "Cnpj", template: '#=cpfCnpj(Cnpj)#', title: "CNPJ", width: "55px" },
             {
                title: "Editar",
                template: "<a onclick='javascript:{EditarEmpresa(this, false);}' class='k-button'>"
                    + "<span class='glyphicon glyphicon glyphicon-pencil'></span></a>",
                width: "50px",
                filterable: false
            },
            {
                title: "Excluir",
                template: "<a onclick='javascript:{ExcluiEmpresa(this, true);}' class='k-button'>"
                    + "<span class='glyphicon glyphicon glyphicon-trash'></span></a>",
                width: "50px",
                filterable: false
            }
        ]
    });
    AutoComplete();
}

function SalvarEmpresa() {
    if ($('#idEmpresa').val() == "0")
        SaveEmpresaCreation();
    else
        UpdateEmpresaEditing();
}

function IncluirEmpresa() {
    empresaOriginal = {
        Id: '',
        IdInscricao: '',
        RazaoSocial: '',
        CNPJ: '',
        InscricaoEstadual: '',
        InscricaoMunicipal: '',
        Endereco: '',
        Numero: '',
        Bairro: '',
        CEP: '',
        Complemento: '',
        Telefone: '',
        CodigoMatriz: '',
        Email: '',
        Cidade: '',
        Estado: '',
        Pais: ''
    };

    LimpaDados();
    
    /* estava comentado */
    //LoadProfiles();
    //LoadAccounts(false);
    //oadGroups(0, false);
    //ToggleSaveActivation(false);
    /* aqui */

    $('#idEmpresa').val("0");
    $('#btnVoltar').hide();
    $('#btnEditar').hide();
    $('#btnCancelar').show();
    $('#btnSalvar').show();

    $('#modalEditarEmpresa').modal({ backdrop: 'static', keyboard: false });
    $('#modalEditarEmpresa .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditarEmpresa .modal-dialog .modal-header center .modal-title strong').html("Incluir Matriz");

    $("#loading-page").hide();
}

function EditarEmpresa(e, locked) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var tituloTela = '';
    $("#loading-page").show();


    $.ajax({
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        url: "/Empresa/Editar",
        data: { "id": dataItem.Id },
        cache: false,
        async: false,
        success: function (result) {
            $('#btnAccountSearch').attr('disabled', 'disabled');
            CarregarDadosEmpresa(result);
            empresaOriginal = {
                Id: result.Id,
                IdInscricao: result.IdInscricao,
                RazaoSocial: result.RazaoSocial,
                CNPJ: result.Cnpj,
                InscricaoEstadual: result.InscricaoEstadual,
                InscricaoMunicipal: result.InscricaoMunicipal,
                Endereco: result.Endereco,
                Numero: result.Numero,
                Bairro: result.Bairro,
                CEP: result.CEP,
                Complemento: result.Complemento,
                Telefone: result.Telefone,
                CodigoMatriz: result.CodigoMatriz,
                Email: result.Email,
                Cidade: result.Cidade,
                Estado: result.Estado,
                Pais: result.Pais
            }
        },
        error: function (result) {
            ShowModalAlerta('Estes dados não podem ser exibidos!');
        }
    });

    if (locked) {
        $('#btnVoltar').show();
        $('#btnEditar').show();
        $('#btnCancelar').hide();
        $('#btnSalvar').hide();

        tituloTela = 'Empresa';
    }
    else {
        $('#btnVoltar').hide();
        $('#btnEditar').hide();
        $('#btnCancelar').show();
        $('#btnSalvar').show();

        tituloTela = 'Editar Empresa'
    }

    $('#modalEditarEmpresa .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditarEmpresa .modal-dialog .modal-header center .modal-title strong').html(tituloTela);
    $('#modalEditarEmpresa').modal({ backdrop: 'static', keyboard: false });

    $('#txtCNPJ').kendoMaskedTextBox({ mask: "00.000.000/0000-00" });
    $('#txtCEP').kendoMaskedTextBox({ mask: "00000-000" });

    //TravarCamposTela(locked);

    $("#loading-page").hide();
}


//CRUD
function SaveEmpresaCreation() {
    var form = $("#empresaForm");
    form.validate();
    

    if (form.valid()) {
        $("#loading-page").show();
        var empresa = {
            IdInscricao: 1,
            RazaoSocial: $('#txtRazaoSocial').val(),
            CNPJ: $('#txtCNPJ').val(),
            InscricaoEstadual: $('#txtInscricaoEstadual').val(),
            InscricaoMunicipal: $('#txtInscricaoMunicipal').val(),
            Endereco: $('#txtEndereco').val(),
            Numero: $('#txtNumero').val(),
            Bairro: $('#txtBairro').val(),
            CEP: $('#txtCEP').val(),
            Complemento: $('#txtComplemento').val(),
            Telefone: $('#txtTelefone').val(),
            CodigoMatriz: $('#txtCodigoMatriz').val(),
            Email: $('#txtEmail').val(),
            Cidade: $('#txtCidade').val(),
            Estado: $('#txtEstado').val(),
            Pais: $('#txtPais').val()

        };

        $.ajax({
            contentType: "application/json",
            url: "/Empresa/CriarEmpresa",
            type: "POST",
            async: true,
            dataType: "json",
            data: JSON.stringify
                ({
                    "idInscricao": 1,
                    "razaoSocial": empresa.RazaoSocial,
                    "cnpj": empresa.CNPJ,
                    "inscricaoEstadual": empresa.InscricaoEstadual,
                    "inscricaoMunicipal": empresa.InscricaoMunicipal,
                    "endereco": empresa.Endereco,
                    "numero": empresa.Numero,
                    "bairro": empresa.Bairro,
                    "cep": empresa.CEP,
                    "complemento": empresa.Complemento,
                    "telefone": empresa.Telefone,
                    "codigoMatriz": empresa.CodigoMatriz,
                    "email": empresa.Email,
                    "cidade": empresa.Estado,
                    "estado": empresa.Estado,
                    "pais": empresa.Pais
                }),

            success: function (result) {
                if (result != 0) {
                    $("#loading-page").hide();
                    $('#modalEditarEmpresa').modal('hide');
                    ShowModalSucesso("Matriz incluida com sucesso!");
                    $("#grid").html("");
                    LoadDsGrid();
                }
                else 
                {
                    ShowModalAlerta(result);
                }
            },
            error: function (result) {
                $("#loading-page").hide();
                $('#modalEditarEmpresa').modal('hide');
                ShowModalAlerta(result);
                $("#grid").html("");
                LoadDsGrid();
            }
        });
    }
    else {
        ShowModalAlerta('A Razão Social e CNPJ são obrigatórios para o cadastro da Matriz');
    }
}

function UpdateEmpresaEditing() {
    var form = $("#empresaForm");
    form.validate();
    $("#loading-page").show();

    if (form.valid()) {
        var empresa = {
            Id: $('#idEmpresa').val(),
            IdInscricao: $('#idInscricao').val(),
            RazaoSocial: $('#txtRazaoSocial').val(),
            CNPJ: $('#txtCNPJ').val(),
            InscricaoEstadual: $('#txtInscricaoEstadual').val(),
            InscricaoMunicipal: $('#txtInscricaoMunicipal').val(),
            Endereco: $('#txtEndereco').val(),
            Numero: $('#txtNumero').val(),
            Bairro: $('#txtBairro').val(),
            CEP: $('#txtCEP').val(),
            Complemento: $('#txtComplemento').val(),
            Telefone: $('#txtTelefone').val(),
            CodigoMatriz: $('#txtCodigoMatriz').val(),
            Email: $('#txtEmail').val(),
            Cidade: $('#txtCidade').val(),
            Estado: $('#txtEstado').val(),
            Pais: $('#txtPais').val()
        };

        $.ajax({
            contentType: "application/json",
            url: "/Empresa/AtualizarEmpresa",
            type: "POST",
            async: true,
            dataType: "json",
            data: JSON.stringify
                ({
                    "id": empresa.Id,
                    "idInscricao": empresa.IdInscricao,
                    "razaoSocial": empresa.RazaoSocial,
                    "cnpj": empresa.CNPJ,
                    "inscricaoEstadual": empresa.InscricaoEstadual,
                    "inscricaoMunicipal": empresa.InscricaoMunicipal,
                    "endereco": empresa.Endereco,
                    "numero": empresa.Numero,
                    "bairro": empresa.Bairro,
                    "cep": empresa.CEP,
                    "complemento": empresa.Complemento,
                    "telefone": empresa.Telefone,
                    "codigoMatriz": empresa.CodigoMatriz,
                    "email": empresa.Email,
                    "cidade": empresa.Cidade,
                    "estado": empresa.Estado,
                    "pais": empresa.Pais
                }),

            success: function (result) {
                $("#loading-page").hide();
                $('#modalEditarEmpresa').modal('hide');
                ShowModalSucesso("Matriz atualizada com sucesso!");
                $("#grid").html("");
                LoadDsGrid();
            },
            error: function (result) {
                $("#loading-page").hide();
                $('#modalEditarEmpresa').modal('hide');
                ShowModalSucesso(result.msg);
                $("#grid").html("");
                LoadDsGrid();
            }
        });
    }
    else {
        ShowModalAlerta('A Razão Social e CNPJ são obrigatórios para o cadastro da Matriz');
    }
}

function ExcluiEmpresa(e, locked) {
    var dataItem = $("#grid").data("kendoGrid").dataItem(e.parentElement.parentElement);
    var tituloTela = '';
    $("#loading-page").show();

        $.ajax({
            type: "POST",
            contentType: 'application/json; charset=utf-8',
            dataType: "json",
            url: "/Empresa/ExcluirEmpresa",
            data: JSON.stringify ({ "id": dataItem.Id }),
            cache: false,
            async: false,
            success: function (result) {
                $("#loading-page").hide();
                $('#modalEditarEmpresa').modal('hide');
                ShowModalSucesso("Matriz excluida com sucesso!");
                $("#grid").html("");
                LoadDsGrid();
            },
            error: function (result) {
                $("#loading-page").hide();
                $('#modalEditarEmpresa').modal('hide');
                ShowModalSucesso(result.msg);
                $("#grid").html("");
            LoadDsGrid();
            }
        });
    
       
}

//Validações
function VerificarCampoAlterado(empresaAtual) {
    if (empresaAtual.Id != empresaOriginal.Id) return true;
    if (empresaAtual.IdInscricao != empresaOriginal.IdInscricao) return true;
    if (empresaAtual.RazaoSocial != empresaOriginal.RazaoSocial) return true;
    if (empresaAtual.CNPJ != empresaOriginal.CNPJ) return true;
    if (empresaAtual.InscricaoEstadual != empresaOriginal.InscricaoEstadual) return true;
    if (empresaAtual.InscricaoMunicipal != empresaOriginal.InscricaoMunicipal) return true;
    if (empresaAtual.Endereco != empresaOriginal.Endereco) return true;
    if (empresaAtual.Numero != empresaOriginal.Numero) return true;
    if (empresaAtual.Bairro != empresaOriginal.Bairro) return true;
    if (empresaAtual.CEP != empresaOriginal.CEP) return true;
    if (empresaAtual.Complemento != empresaOriginal.Complemento) return true;
    if (empresaAtual.Telefone != empresaOriginal.Telefone) return true;
    if (empresaAtual.CodigoMatriz != empresaOriginal.CodigoMatriz) return true;
    if (empresaAtual.Email != empresaOriginal.Email) return true;
    if (empresaAtual.Cidade != empresaOriginal.Cidade) return true;
    if (empresaAtual.Estado != empresaOriginal.Estado) return true;
    if (empresaAtual.Pais != empresaOriginal.Pais) return true;


    return false; //ajustar
}

function CarregarDadosEmpresa(dataItem) {
    $('#idEmpresa').val(dataItem.Id);
    $('#idInscricao').val(dataItem.IdInscricao);
    $('#txtRazaoSocial').val(dataItem.RazaoSocial);
    $('#txtCNPJ').val(dataItem.Cnpj);
    $('#txtInscricaoEstadual').val(dataItem.InscricaoEstadual);
    $('#txtInscricaoMunicipal').val(dataItem.InscricaoMunicipal);
    $('#txtEndereco').val(dataItem.Endereco);
    $('#txtNumero').val(dataItem.Numero);
    $('#txtBairro').val(dataItem.Bairro);
    $('#txtCEP').val(dataItem.CEP);
    $('#txtComplemento').val(dataItem.Complemento);
    $('#txtTelefone').val(dataItem.Telefone);
    $('#txtCodigoMatriz').val(dataItem.CodigoMatriz);
    $('#txtEmail').val(dataItem.Email);
    $('#txtCidade').val(dataItem.Cidade);
    $('#txtEstado').val(dataItem.Estado);
    $('#txtPais').val(dataItem.Pais);
}

function EditarVisualizacaoEmpresa() {
    $('#btnVoltar').hide();
    $('#btnEditar').hide();
    $('#btnCancelar').show();
    $('#btnSalvar').show();

    $('#modalEditarEmpresa .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalEditarEmpresa .modal-dialog .modal-header center .modal-title strong').html("Editar Empresa");

    //TravarCamposTela(false);
}

function VerificarCancelarEdicao() {
    var dataHTML = "";

    var empresaAtual = {
        Id: $('#idEmpresa').val(),
        IdInscricao: $('#idInscricao').val(),
        RazaoSocial: $('#txtRazaoSocial').val(),
        CNPJ: $('#txtCNPJ').val(),
        InscricaoEstadual: $('#txtInscricaoEstadual').val(),
        InscricaoMunicipal: $('#txtInscricaoMunicipal').val(),
        Endereco: $('#txtEndereco').val(),
        Numero: $('#txtNumero').val(),
        Bairro: $('#txtBairro').val(),
        CEP: $('#txtCEP').val(),
        Complemento: $('#txtComplemento').val(),
        Telefone: $('#txtTelefone').val(),
        CodigoMatriz: $('#txtCodigoMatriz').val(),
        Email: $('#txtEmail').val(),
        Cidade: $('#txtCidade').val(),
        Estado: $('#txtEstado').val(),
        Pais: $('#txtPais').val()
    };

    if (VerificarCampoAlterado(empresaAtual) == true) {
        dataHtml = '<div class="row">'
                   + '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">'
                       + 'As alterações serão perdidas. Deseja mesmo cancelar?'
                   + '</div>'
                 + '</div>';

        $('#modalCancelarEdicao').modal({ backdrop: 'static', keyboard: false });
        $('#modalCancelarEdicao .modal-dialog .modal-body').html("");
        $('#modalCancelarEdicao .modal-dialog .modal-body').html(dataHtml);
    }
    else {
        $('#modalCancelarEdicao').modal('hide');
        $('#modalEditarEmpresa').modal('hide');
    }
}

function LimpaDados() {
    $('#idEmpresa').val('');
    $('#idInscricao').val('');
    $('#txtRazaoSocial').val('');
    $('#txtCNPJ').val('');
    $('#txtInscricaoEstadual').val('');
    $('#txtInscricaoMunicipal').val('');
    $('#txtEndereco').val('');
    $('#txtNumero').val('');
    $('#txtBairro').val('');
    $('#txtCEP').val('');
    $('#txtComplemento').val('');
    $('#txtTelefone').val('');
    $('#txtCodigoMatriz').val('');
    $('#txtEmail').val('');
    $('#txtCidade').val('');
    $('#txtEstado').val('');
    $('#txtPais').val('');
}

//--- Função Customizada ---//
function BuscarDadosGrid(grid, msgNenhumRegistro) {
    $filter = new Array();
    var orfilter = "";

    if (grid == undefined)
        grid = $("#grid").data("kendoGrid");

    if (msgNenhumRegistro == undefined) {
        msgNenhumRegistro = "Nenhum registro encontrado!";
    }
    /*
    $('#txtCodMatrizFiltro').val()
    $('#txtRazaoSocialFiltro').val()
    $('#txtCNPJFiltro').val()
    cpfCnpj(Cnpj)
    */


    $(".filter").each(function (index, ele) {
        switch ($(this).val()) {
            case "":
            case "Escolha ...":
                break;

            default:
                if ($(ele).data("type") == "date") {
                    $filter.push({ field: $(ele).data("field"), type: $(ele).data("type"), operator: $(ele).data("operator"), value: FormatDateKendo($(ele).val()) });
                }
                else {
                    if ($(ele).data("field") == "Cnpj") {
                        var limpa = $(ele).val(); limpa = limpa.replace('.', ''); limpa = limpa.replace('.', ''); limpa = limpa.replace("/", ""); limpa = limpa.replace('-', '');
                        //limpa = cpfCnpj(limpa);
                        $filter.push({ field: $(ele).data("field"), type: $(ele).data("type"), operator: ele.dataset.operator, value: limpa });
                    } else {
                        $filter.push({ field: $(ele).data("field"), type: $(ele).data("type"), operator: ele.dataset.operator, value: $(ele).val() });
                    }
                }
                break;
        }
    });

    if ($filter.length >= 2 || ($filter.length == 1 && $filter[0].type == "date")) {
        orfilter = { logic: "and", filters: $filter };
    }
    else {
        orfilter = { filters: $filter };
    }

    grid.dataSource.filter(orfilter);

    if (grid.dataSource.total() == 0) {
        ShowModalAlerta(msgNenhumRegistro);
    }
}