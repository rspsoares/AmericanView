function CFOPRef() {
    CarregarKMS();
    //var validator = $(".modal-body").kendoValidator({
    //    rules: {
    //        hasItems: function (input) {
    //            if (input.is("txtCFOPReferencia")) {
    //                //Get the MultiSelect instance
    //                var ms = input.data("kendoMultiSelect");
    //                if (ms.value().length === 1) {
    //                    return false;
    //                }
    //            }
    //            return true;
    //        }
    //    },
    //    messages: {
    //        hasItems: "Please select at least one product"
    //    }
    //}).data("kendoValidator");
}

function CarregarKMS() {
    var cfopListRef = $("#txtCFOPReferencia").kendoMultiSelect({
        itemTemplate: kendo.template('<span class="Codigo">#= Codigo # -</span> #= Descricao #'),
        optionLabel: "Selecione um CFOP...",
        dataTextField: "Codigo",
        dataValueField: "Codigo",
        dataSource: GetDsRefCFOP(),
        change: onChangeCFOPRef,
        select: onSelectCFOPRef
    }).data("kendoMultiSelect");
}

function onSelectCFOPRef(e) {
    //$('#descCFOPRef').text("");
   // var dataItem = this.dataItem(e.item);
   // $('#descCFOPRef').text(dataItem.Descricao);
}

function onChangeCFOPRef(e) {
  //  $('#descCFOPRef').text("");
  //  var dataItem = this.dataItems();
 //   for (var i in dataItem) {
  //      $('#descCFOPRef').append(dataItem[i].Descricao + "<br />");
  //  }
  //  $('#descCFOPRef').append("<br />");
}
function GetDsRefCFOP() {
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/DocumentosFiscais/BuscarCFOPRefs",
                type: "GET",
                dataType: "json",
                cache: false
            }
        },
        schema: {
            data: function (result) {
                return result.Data;
            },
            model: {
                id: "Id",
                fields: {
                    Codigo: { editable: false },
                    Descricao: { editable: false }
                }
            }
        }
    });
    return dataSource;
}
