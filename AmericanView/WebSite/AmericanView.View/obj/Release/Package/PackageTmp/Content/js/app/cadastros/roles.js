$(document).ready(function () {
    CarregarGrid();
    //PerfilDropDown();
    //StatusDropDown();
    //AutoComplete();

    //$('#btnPesquisarUsuarios').click(function () {
    //    BuscarUsuarios();
    //});
});

function CarregarGrid() {
    $("#grid").kendoGrid({
        dataSource: {
            transport: {
                read: {
                    url: "/Roles/Pesquisar",
                    contentType: 'application/json; charset=utf-8',
                    dataType: "Json"
                }
            },
            schema: {
                model: {
                    fields: {
                        Name: { type: "string" }
                    }
                }
            },
            pageSize: 10
        },
        scrollable: true,
        sortable: true,
        pageable: {
            pageSizes: [10, 25]
        },
        detailInit: detailInit,
        columns: [
            { field: "Name", title: "Role" },
            { field: "LoginUsuario", title: "Login" },
            { field: "EmailUsuario", title: "E-Mail" },
            { field: "PerfilUsuario", title: "Perfil" },
            { field: "StatusUsuario", title: "Status" },
            {
                title: " ",
                template: "<a href='/Usuarios/Edit/#=IDUsuario#' class='k-button'>"
                    + "<span class='glyphicon glyphicon-pencil'></span></a>",
                width: "48px",
                filterable: false
            }
        ]
    });
}