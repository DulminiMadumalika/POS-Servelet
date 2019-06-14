$(window).on('load', function () {
    generateId();
    loadTable();
});

function generateId(){

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/items',
        async : true,
        contentType : 'application/json'
    };

    var id = "Item001";
    $.ajax(ajaxConfig).done(function (response) {

        var item = response;

        if(item.length > 0) {
            var iid = parseInt(item[item.length-1].code.substr(4))+1;
            var pref = "Item";
            if(iid.toString().length == 1){
                pref = "Item00";
            }else if(iid.toString().length == 2){
                pref = "Item0";
            }
            id = pref+iid;
        }
        $('#txtItemCode').val(id);

    }).fail(function (jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });


}

$('#btnItemSubmit').click(function () {

    var bool = false;

    if($('#txtItemDescription').val().trim().length == 0){
        $('#txtItemDescription').css('border-color','red');
        $('#txtItemDescription').focus();
        $('#txtItemDescription').select();
        bool = true;
    }

    if($('#txtItemQty').val().trim().length == 0){
        $('#txtName').css('border-color','red');
        $('#txtName').focus();
        $('#txtName').select();
        bool = true;
    }

    if($('#txtItemQty').val().trim().length > 0){
        var regEx = /^\d*$/;
        var val1 = regEx.test($('#txtItemQty').val());
        if(!val1) {
            alert("Please Enter a Number");
            $('#txtItemUnitPrice').css('border-color','red');
            $('#txtItemQty').focus();
            $('#txtItemQty').select();
            bool = true;
        }
    }

    if($('#txtItemUnitPrice').val().trim().length == 0){
        $('#txtItemUnitPrice').css('border-color','red');
        $('#txtItemUnitPrice').focus();
        $('#txtItemUnitPrice').select();
        bool = true;
    }

    if($('#txtItemUnitPrice').val().trim().length > 0){
        var regEx = /^\d*$/;
        var val1 = regEx.test($('#txtItemUnitPrice').val());
        if(!val1) {
            alert("Please Enter a valid Price");
            $('#txtItemUnitPrice').css('border-color','red');
            $('#txtItemUnitPrice').focus();
            $('#txtItemUnitPrice').select();
            bool = true;
        }
    }

    if(bool){
        return;
    }

    if($('#btnItemSubmit').text() == "Submit"){

        var details = {
            code:$('#txtItemCode').val(),
            description:$('#txtItemDescription').val(),
            unitPrice : parseFloat($('#txtItemUnitPrice').val()),
            qty:parseInt($('#txtItemQty').val())
        };

        var ajaxConfig = {
            method : 'POST',
            url : 'http://localhost:8080/pos/items',
            async : true,
            data : JSON.stringify(details),
            contentType : 'application/json'
        };

        $.ajax(ajaxConfig).done(function (response) {
            if(response){
                alert('Item has been saved successfully');
                loadTable();
                clearForm();
            }else{
                alert("Failed to save item");
            }
        }).fail(function(jqxhr,textStatus,errorMsg) {
            console.log(errorMsg);
            alert("Failed to save item");
        });

    }else if($('#btnItemSubmit').text() == "Update"){

        var code = $('#txtItemCode').val();

        var details = {
            description:$('#txtItemDescription').val(),
            unitPrice : parseFloat($('#txtItemUnitPrice').val()),
            qty: parseInt($('#txtItemQty').val())
        };

        var ajaxConfig = {
            method : 'PUT',
            url : 'http://localhost:8080/pos/items/'+code,
            async : true,
            data : JSON.stringify(details),
            contentType : 'application/json'
        };

        $.ajax(ajaxConfig).done(function (response) {
            if(response){
                alert('Item has been updated successfully');
                loadTable();
                clearForm();
            }else{
                alert("Failed to update item");
            }
            afterUpdate();
        }).fail(function(jqxhr,textStatus,errorMsg) {
            console.log(errorMsg);
            alert("Failed to update item");
        });

    }
    // loadTable();
    // clearForm();
});

function afterUpdate() {
    $('#btnItemSubmit').text("Submit");
}

function clearForm(){
    $('#txtItemCode').val("");
    $('#txtItemDescription').val("");
    $('#txtItemQty').val("");
    $('#txtItemUnitPrice').val("");
}

$('#btnNewItem').click(function () {
    generateId();
    $('#txtItemDescription').val("");
    $('#txtItemQty').val("");
    $('#txtItemUnitPrice').val("");
    afterUpdate();
});

function loadTable() {
    $('#tblItem tbody tr').remove();

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/items',
        async : true,
        contentType : 'application/json'
    };

    $.ajax(ajaxConfig).done(function (response) {
        var item = response;
        for(var i=0; i<item.length; i++){
            $('#tblItem tbody').append('<tr>' +
                '<td>'+ item[i].code+'</td>' +
                '<td>'+ item[i].description +'</td>' +
                '<td>'+ item[i].qty +'</td>' +
                '<td>'+ item[i].unitPrice +'</td>' +
                '<td><i class="fas fa-trash"></i></td>' +
                '</tr>');

            $('#tblItem tbody:last-child').find('i').click(function () {
                setInterval(deleteItem($(this),4000));
            });

            $('#tblItem tbody').children().last().click(function () {
                $('#btnItemSubmit').text('Update');
                setSelectedRow($(this));
                $(this).css('background-color','#AED6F1');
            });
        }
    }).fail(function(jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });
}

function setSelectedRow(id){
    $('#txtItemCode').val($(id.children()[0]).text());
    $('#txtItemDescription').val($(id.children('td')[1]).text());
    $('#txtItemQty').val($(id.children('td')[2]).text());
    $('#txtItemUnitPrice').val($(id.children('td')[3]).text());
}

$('#txtItemDescription').keypress(function(){
    $('#txtItemDescription').css('border-color','#ced4da');
});

$('#txtItemQty').keypress(function(){
    $('#txtItemQty').css('border-color','#ced4da');
});

$('#txtItemUnitPrice').keypress(function(){
    $('#txtItemUnitPrice').css('border-color','#ced4da');
});

function deleteItem(id){

    id.parents('tr').fadeOut('slow',function () {
        var code = $(id.parents('tr').children('td')[0]).text();
        id.parent('tr').remove();

        var ajaxConfig = {
            method : 'DELETE',
            url : 'http://localhost:8080/pos/items/'+code,
            async : true,
            contentType : 'application/json'
        };

        $.ajax(ajaxConfig).done(function (response) {

            if(response){
                alert("Item Deleted");
            }else{
                alert("Failed to Delete Item");
            }

        }).fail(function (jqxhr,textStatus,errorMsg) {
            console.log(errorMsg);
        });
    });
}

