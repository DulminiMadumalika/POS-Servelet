$(window).on('load', function () {
    generateId();
    loadTable();
});

function generateId(){

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/customers',
        async : true,
        contentType : 'application/json'
    };

    var id = "C001";

    $.ajax(ajaxConfig).done(function (response) {

        if(response.length>0){
            var strId = (response[response.length-1].id).substr(1);
            var cid = parseInt(strId)+1;
            var pref = "C";
            if(cid.toString().length == 1){
                pref = "C00";
            }else if(cid.toString().length == 2){
                pref = "C0";
            }
            id = pref+cid;
        }

        $('#txtCusId').val(id);

    }).fail(function (jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });

}

$('#btnCusSubmit').click(function () {

    var bool = false;
    if($('#txtAddress').val().trim().length == 0){
        $('#txtAddress').css('border-color','red');
        $('#txtAddress').focus();
        $('#txtAddress').select();
        bool = true;
    }
    if($('#txtName').val().trim().length == 0){
        $('#txtName').css('border-color','red');
        $('#txtName').focus();
        $('#txtName').select();
        bool = true;
    }
    if(bool){
        return;
    }

    if($('#btnCusSubmit').text() == "Submit"){

        var details = {
            id:$('#txtCusId').val(),
            name:$('#txtName').val(),
            address:$('#txtAddress').val()
        };

        var ajaxConfig = {
            method : 'POST',
            url : 'http://localhost:8080/pos/customers',
            async : true,
            data : JSON.stringify(details),
            contentType : 'application/json'
        };

        $.ajax(ajaxConfig).done(function (response) {
            if(response){
                alert('Customer has been saved successfully');
                loadTable();
                clearForm();
            }else{
                alert("Failed to save customer");
            }
        }).fail(function(jqxhr,textStatus,errorMsg) {
            console.log(errorMsg);
            alert("Failed to save customer");
        });

    }else if($('#btnCusSubmit').text() == "Update"){

        var id = $('#txtCusId').val();

        var details = {
            name:$('#txtName').val(),
            address:$('#txtAddress').val()
        };

        var ajaxConfig = {
            method : 'PUT',
            url : 'http://localhost:8080/pos/customers/'+id,
            async : true,
            data : JSON.stringify(details),
            contentType : 'application/json'
        };

        $.ajax(ajaxConfig).done(function (response) {
            if(response){
                alert('Customer has been updated successfully');
                loadTable();
                clearForm();
            }else{
                alert("Failed to update customer");
            }
        }).fail(function(jqxhr,textStatus,errorMsg) {
            console.log(errorMsg);
            alert("Failed to update customer");
        });

        afterUpdate();
    }
    // loadTable();
    // clearForm();

});

function afterUpdate() {
    $('#btnCusSubmit').text("Submit");
}

function clearForm(){
    $('#txtCusId').val("");
    $('#txtName').val("");
    $('#txtAddress').val("");
}

$('#btnNewCustomer').click(function () {
    generateId();
    $('#txtName').val("");
    $('#txtAddress').val("");
    afterUpdate();
});

function loadTable() {
    $('#tblCustomer tbody tr').remove();

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/customers',
        async : true,
        contentType : 'application/json'
    };

    $.ajax(ajaxConfig).done(function (response) {

        var customer = response;

        for(var i=0; i<customer.length; i++){
            $('#tblCustomer tbody').append('<tr>' +
                '<td>'+ customer[i].id+'</td>' +
                '<td>'+ customer[i].name +'</td>' +
                '<td>'+ customer[i].address +'</td>' +
                '<td><i class="fas fa-trash"></i></td>' +
                '</tr>');

            $('#tblCustomer tbody:last-child').find('i').click(function () {
                setInterval(deleteCustomer($(this),4000));
            });

            $('#tblCustomer tbody').children().last().click(function () {
                $('#btnCusSubmit').text('Update');
                setSelectedRow($(this));
                // $(this).css('background-color','#AED6F1');
            });
        }

    }).fail(function(jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });
}

function setSelectedRow(id){
    $('#txtCusId').val($(id.children()[0]).text());
    $('#txtName').val($(id.children('td')[1]).text());
    $('#txtAddress').val($(id.children('td')[2]).text());
}

$('#txtName').keypress(function(){
    $('#txtName').css('border-color','#ced4da');
});

$('#txtAddress').keypress(function(){
    $('#txtAddress').css('border-color','#ced4da');
});

function deleteCustomer(id){
    id.parents('tr').fadeOut('slow',function () {
        var code = $(id.parents('tr').children('td')[0]).text();

        var ajaxConfig = {
            method : 'GET',
            url : 'http://localhost:8080/pos/orders',
            async : true,
            contentType : 'application/json'
        };

        $.ajax(ajaxConfig).done(function (response) {

            var orders = response;

            for(var i=0; i<orders.length; i++){
                if(orders[i].customerId == code){
                    alert("Cannot Delete customer !");
                    loadTable();
                    return;
                }
            }
            var ajaxConfig = {
                method : 'DELETE',
                url : 'http://localhost:8080/pos/customers/'+code,
                async : true,
                contentType : 'application/json'
            };

            $.ajax(ajaxConfig).done(function (response) {

                if(response){
                    alert("Customer Deleted");
                    loadTable();
                    clearForm();
                }else{
                    alert("Failed to Delete Customer");
                }

            }).fail(function (jqxhr,textStatus,errorMsg) {
                console.log(errorMsg);
            });

        }).fail(function (jqxhr,textStatus,errorMsg) {
            console.log(errorMsg);
        });

    });
}


