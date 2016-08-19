$(document).ready(function () {
    kendo.culture("pt-BR");    
});

/* -- Formatações -- */
function FormatDateKendo(date) {
    if (date != null) 
        date = kendo.toString(kendo.parseDate(date, 'yyyy-MM-dd HH:mm:ss'), 'dd/MM/yyyy HH:mm:ss')    
    else 
        date = '';    

    return date;
}

Number.prototype.FormatarMilhar = function () {
    var parts = (this + "").split(","),
        main = parts[0],
        len = main.length,
        output = "",
        i = len - 1;

    while (i >= 0) {
        output = main.charAt(i) + output;
        if ((len - i) % 3 === 0 && i > 0) {
            output = "." + output;
        }
        --i;
    }
    // put decimal part back
    if (parts.length > 1) {
        output += "," + parts[1];
    }
    return output;
}

/* -- MODAL POPUPs -- */
function FecharModal(e) {
    $('#' + e.parentElement.parentElement.parentElement.parentElement.id).data('data', null);
    $('#' + e.parentElement.parentElement.parentElement.parentElement.id).modal("hide");    
}

function ShowModalAlerta(dataHtml) {
    $('#modalAlert').modal({ backdrop: 'static', keyboard: false });
    $('#modalAlert .modal-dialog .modal-header center .modal-title strong').html("");
    $('#modalAlert .modal-dialog .modal-header center .modal-title strong').html("Atenção");
    $('#modalAlert .modal-dialog .modal-body .alert').html("");
    $('#modalAlert .modal-dialog .modal-body .alert').html(dataHtml);
}

jQuery.extend({
    compare: function (arrayA, arrayB) {
        if (arrayA.length != arrayB.length) { return false; }
        // sort modifies original array
        // (which are passed by reference to our method!)
        // so clone the arrays before sorting
        var a = jQuery.extend(true, [], arrayA);
        var b = jQuery.extend(true, [], arrayB);
        a.sort(); 
        b.sort();
        for (var i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i]) { 
                return false;
            }
        }
        return true;
    }
});
