
/**
 * Controle Central - Método inicializador para carga dos componentes
 * Carga de Perfis
 */
function CarregaComponentes() {
    GridPerfis();
}

/**
 * Grid Perfis - Carrega perfis do sistema
 * Inclui CRUD, Schema e templates
 */
function GridPerfis(){
    $("#grid").kendoGrid({
        dataSource: {
            transport: {
                read: function(options){
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json; charset=utf-8',
                        dataType: "json",
                        url: "/Perfil/PesquisarPerfis",
                        cache: false,
                        success: function (result) {
                            options.success(result);
                        }
                    });
                },
                update: function(dados){
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json; charset=utf-8',
                        dataType: "json",
                        url: "/Perfil/Editar",
                        data: { "entidade": JSON.stringify(dados.data) },
                        cache: false,
                        success: function (result) {
                            alert(result.mensagem);
                            $('#grid').data('kendoGrid').dataSource.read();
                            $('#grid').data('kendoGrid').refresh();
                        }
                    });
                },
                destroy: function(dados){
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json; charset=utf-8',
                        dataType: "json",
                        url: "/Perfil/Remover",
                        cache: false,
                        data: { "entidade": JSON.stringify(dados.data) },
                        success: function (result) {
                            alert(result.mensagem);
                            $('#grid').data('kendoGrid').dataSource.read();
                            $('#grid').data('kendoGrid').refresh();
                        }
                    });
                },
                create: function(dados){
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json; charset=utf-8',
                        dataType: "json",
                        url: "/Perfil/Criar",
                        cache: false,
                        data: { "entidade": JSON.stringify(dados.data) },
                        success: function (result) {
                            alert(result.mensagem);
                            $('#grid').data('kendoGrid').dataSource.read();
                            $('#grid').data('kendoGrid').refresh();
                        }
                    });
                }
            },
            pageSize: 10,
            schema: {
                model: {
                    id: "Identificador",
                    fields: {
                        Identificador: { editable: false },
                        Nome: { type: "text", editable: true, validation: { required: true, min: 3 } },
                        Descricao: { type: "text", editable: true, validation: { required: true, min: 3 } }
                    }
                }
            }
        },
        scrollable: true,
        sortable: true,
        resizable: true,
        pageable: {
            pageSizes: [10, 25, 50]
        },
        toolbar: [{ name: "create" , text: "Incluir"}],
        editable: "inline",
        columns: [
            { field: "Identificador", width: "0%", title: ""},
            { field: "Nome", width: "20%", title: "Perfil" },
            { field: "Descricao", width: "50%", title: "Descrição" },
            { command: [{ name: "edit", text: { edit: "Atualizar", update: "Salvar", cancel: "Cancelar" } }, { name: "destroy", text: "Remover" }], title: "Atualizar/Remover", width: "20%" },
            { command: { text: "Permissões", click: mostrarPermissoes }, title: "Permissões", width: "10%" }
        ]
    });
}

/**
 * Modal Permissões - Modal para associação entre Perfil e Permissões
 * Carga e controle de chamada para modal
 */
function mostrarPermissoes(e) {    
    e.preventDefault();
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    $("#meuPerfil").text("Selecione as permissões para o perfil de " + dataItem['Nome']);
    $("#meuIdPerfil").text(dataItem['Identificador']);
    $('#myModal').modal({ backdrop: 'static', keyboard: false });
    var idf = dataItem['Identificador'];
    GridPermissoes(idf);
}

/**
 * Grid Permissões - Selecionador das permissões relativas do perfil
 * Checkbox para selecionar os perfis associados
 */
function GridPermissoes(idperfil) {
    var idf = idperfil;
    $("#gridPerms").kendoGrid({
        dataSource: {
            transport: {
                read: function (options) {
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json; charset=utf-8',
                        dataType: "json",
                        url: "/Perfil/PesquisarPermissoes",
                        data: { "idPerfil": idf },
                        cache: false,
                        success: function (result) {
                            options.success(result);
                        }
                    });
                }
            },
            pageSize: 5,
            schema: {
                model: {
                    id: "Identificador",
                    fields: {
                        Ativa: {type: "boolean", editable: true},
                        Identificador: {type: "integer" ,editable: false },
                        Nome: { type: "text", editable: false },
                        Descricao: { type: "text", editable: false }
                    }
                }
            }
        },
        scrollable: true,
        sortable: true,
        pageable: {
            pageSizes: [5, 10, 50]
        },
        columns: [
            { field: "Identificador", width: "0%", title: "" },
            {
                field: "Ativa",
                template: '<input type="checkbox" #= Ativa ? "checked=checked" : "" # disabled="disabled" ></input>',
                title: "Permitir",
                width: "10%"
            },
            { field: "Nome", width: "20%", title: "Perfil" },
            { field: "Descricao", width: "70%", title: "Descrição" }
        ]
    });
}

/**
 * Salva as permissões - Adiciona ou Remove permissões de um Perfil
 * Busca as pessões marcadas como "Permitir" para adicionar ao Perfil
 */
function SalvarPermissoes() {
    var idPerfil = $('#meuIdPerfil').val();
    var grid = $('#gridPerms').data('kendoGrid');
    var campos = $("#gridPerms").data("kendoGrid").dataSource.view();
    var displayedDataAsJSON = JSON.stringify(campos);
    displayedDataAsJSON = "{\"data\":" + displayedDataAsJSON + "}";

    var requestData = {
        IdentGrid: idProcess,
        Classificacoes: displayedDataAsJSON
    };

    $.ajax({
        url: 'Processamento/AtualizarEntradasJSON',
        type: 'POST',
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify(requestData),
        success: function (resultado) {
            if (resultado.Gravou) {
                alert(resultado.Mensagem);
            }
            else if (resultado.Excecao) {
                alert("Falha na gravação, entre em contato com o suporte, o erro encontrado foi: " + resultado.Mensagem);
            }
            else {
                alert("É necessário preencher " + resultado.Mensagem + " para gravar");
            }
        }
    });
}