$(window).on('load', function () {
    // $('#txtOrderDate').val(new Date().toLocaleDateString());

    var stDate = new Date();
    var month = stDate.getMonth()+1;
    var nDate = stDate.getFullYear()+'-'+month+'-'+stDate.getDate();

    $('#txtOrderDate').val(nDate);
    generateOrderId();

    $('#txtTotal').val(0);
});

function generateOrderId(){

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/orders',
        async : true,
        contentType : 'application/json'
    };

    var ordId = "Order001";

    $.ajax(ajaxConfig).done(function (response) {

        var orders = response;

        if(orders.length>0){

            var maxId = orders[0].oid;

            for(var i=0; i<orders.length; i++){
                if(maxId < orders[i].oid){
                    maxId = orders[i].oid;
                }
            }

            var id = maxId+1;
            var pref = "";
            if(id.toString().length == 1){
                pref = "00";
            }
            if(id.toString().length == 2){
                pref = "0";
            }
            var fId = pref+id;
            ordId = 'Order'+fId;
        }

        $('#txtOrderId').val(ordId);

    }).fail(function (jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });
}

var cusIdArray = [];

var ajaxConfig = {
    method : 'GET',
    url : 'http://localhost:8080/pos/customers',
    async : true,
    contentType : 'application/json'
};

$.ajax(ajaxConfig).done(function (response) {

    var customer = response;

    for(var i=0; i<customer.length; i++){
        $('#cmbCusId').append("<option>"+customer[i].id+"</option>");
        $('#cmbCusId').change(function (){
            var id = $('#cmbCusId option:selected').text();
            findName(id);
        });
        $('#cmbCusId option:first-child').attr("selected", "selected");
        var id = $('#cmbCusId option:selected').text();
        findName(id);
    }

}).fail(function (jqxhr,textStatus,errorMsg) {
    console.log(errorMsg);
});


function findName(id){
    $('#cmbCusId').css('border-color', '#ced4da');

    var name = "";

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/customers',
        async : true,
        contentType : 'application/json'
    };

    $.ajax(ajaxConfig).done(function (response) {

        var customer = response;

        for (var i = 0; i < customer.length; i++) {
            if (customer[i].id == id) {
                name = customer[i].name;
            }
        }
        $('#txtCusName').val(name);

    }).fail(function (jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });

}

var ajaxConfig = {
    method : 'GET',
    url : 'http://localhost:8080/pos/items',
    async : true,
    contentType : 'application/json'
};

$.ajax(ajaxConfig).done(function (response) {

    var item = response;

    for (var i = 0; i < item.length; i++) {
        $('#cmbitemCode').append("<option>" + item[i].code + "</option>");
        $('#cmbitemCode').change(function () {
            var id = $('#cmbitemCode option:selected').text();
            setItemValues(id);
        });

        $('#cmbitemCode option:first-child').attr("selected", "selected");
        var iId = $('#cmbitemCode option:selected').text();
        setItemValues(iId);
    }
}).fail(function (jqxhr,textStatus,errorMsg) {
    console.log(errorMsg);
});


function setItemValues(id){

    $('#cmbitemCode').css('border-color', '#ced4da');

    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/items',
        async : true,
        contentType : 'application/json'
    };

    $.ajax(ajaxConfig).done(function (response) {

        var item = response;
        for (var i = 0; i < item.length; i++) {
            if (item[i].code == id) {
                $('#txtDescription').val(item[i].description);
                $('#txtUnitPrice').val(item[i].unitPrice);
                setQuantityOnHnd(item[i].qty, item[i].code);
            }
        }
    }).fail(function (jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });
}

var total = 0;
var itemArray = [];

$('#btnSubmit').click(function () {

    if($('#txtCusName').val().length == 0){
        $('#cmbCusId').focus();
        $('#cmbCusId').css('border-color', 'red');
        alert("Please select a customer !");
    }

    if($('#txtDescription').val().length == 0){
        $('#cmbitemCode').focus();
        $('#cmbitemCode').css('border-color', 'red');
        alert("Please select an item !");
    }

    if($('#txtQuantity').val().length == 0){
        $('#txtQuantity').focus();
        $('#txtQuantity').select();
        $('#txtQuantity').css('border-color', 'red');
        alert("Please Enter a Quantity !");
        return;
    }

    var regExp = /^\d*$/;
    var text = $('#txtQuantity').val();
    var bool = regExp.test(text);

    if(!bool){
        $('#txtQuantity').focus();
        $('#txtQuantity').select();
        $('#txtQuantity').css('border-color', 'red');
        alert("Please Enter a number!");
        return;
    }

    if($('#txtQuantity').val() == 0){
        $('#txtQuantity').focus();
        $('#txtQuantity').select();
        $('#txtQuantity').css('border-color', 'red');
        alert("Please Enter a Valid Quantity !");
        return;
    }

    if(parseInt($('#txtQuantity').val()) > parseInt($('#txtQtyOnHand').val())){
        $('#txtQuantity').focus();
        $('#txtQuantity').select();
        $('#txtQuantity').css('border-color', 'red');
        alert("You cannot order this much of quantity !");
        return;
    }

    var subTot = parseInt($('#txtQuantity').val()) * parseFloat($('#txtUnitPrice').val());
    var icode = $('#cmbitemCode option:selected').text();
    var bool = false;
    for(var i=0; i<itemArray.length; i++){
        if(itemArray[i] == icode){
            bool = true;
        }
    }

    if($('#btnSubmit').text() == "Update"){
        if(bool){
            for(var i=0; i<$('#tblOrder tbody tr').length; i++){
                var icd = $($($('#tblOrder tbody tr')[i]).children()[0]).text();

                if(icd == icode){
                    var temTot = subTot;//true value
                    var prevQty = $($($('#tblOrder tbody tr')[i]).children()[2]).text();
                    subTot = parseInt(temTot) - (parseInt(prevQty)*parseFloat($('#txtUnitPrice').val()));

                    $($($('#tblOrder tbody tr')[i]).children()[2]).html($('#txtQuantity').val());
                    $($($('#tblOrder tbody tr')[i]).children()[4]).html(temTot);
                }
            }
        }
        total += subTot;
        $('#txtTotal').val(total);
        $('#btnSubmit').text("Submit");
        setQuantityOnHnd($('#txtQtyOnHand').val(),$('#cmbitemCode option:selected').text());
        $('#txtQuantity').val("");
        return;
    }

    if(bool){
        for(var i=0; i<$('#tblOrder tbody tr').length; i++){
            var icd = $($($('#tblOrder tbody tr')[i]).children()[0]).text();

            if(icd == icode){
                var prevQty = $($($('#tblOrder tbody tr')[i]).children()[2]).text();
                var prevTot = $($($('#tblOrder tbody tr')[i]).children()[4]).text();
                $($($('#tblOrder tbody tr')[i]).children()[2]).html(parseInt(prevQty)+ parseInt($('#txtQuantity').val()));
                $($($('#tblOrder tbody tr')[i]).children()[4]).html(parseInt(prevTot)+subTot);
            }
        }
    }else{
        itemArray[itemArray.length]= icode;

        $('#tblOrder tbody').append(
            '<tr>' +
            '<td>'+$('#cmbitemCode option:selected').text()+'</td>' +
            '<td>'+$('#txtDescription').val()+'</td>'+
            '<td>'+$('#txtQuantity').val()+'</td>'+
            '<td>'+$('#txtUnitPrice').val()+'</td>'+
            '<td>'+ subTot +'</td>'+
            '<td><i class="fas fa-trash"></i></td>'
            +'</tr>'
        );

        $('#tblOrder tbody').children('tr').last().find('i').click(function () {
            setInterval(deleteOrderItem($(this)), 4000);
        });

        $('#tblOrder tbody').children('tr').last().click(function () {
            loadFields($(this));
            $('#btnSubmit').text("Update");
        });
    }

    total += subTot;
    $('#txtTotal').val(total);
    setQuantityOnHnd($('#txtQtyOnHand').val(),$('#cmbitemCode option:selected').text());
    $('#txtQuantity').val("");

});

function loadFields(id) {
    $('#cmbitemCode').val($(id.children()[0]).text());
    $('#txtDescription').val($(id.children()[1]).text());
    $('#txtUnitPrice').val($(id.children()[3]).text());
    $('#txtQuantity').val($(id.children()[2]).text());

    ///////////////////////////////////////////////////////////////////////////////////////////
    var ajaxConfig = {
        method : 'GET',
        url : 'http://localhost:8080/pos/items',
        async : true,
        contentType : 'application/json'
    };

    $.ajax(ajaxConfig).done(function (response) {

        var item = response;
        var q = 0;
        for(var i=0; i<item.length; i++){
            if(item[i].code == $(id.children()[0]).text()){
                q = item[i].qty;
            }
        }

        $('#txtQuantity').focus();
        $('#txtQuantity').select();
        setQuantityOnHnd(q, $(id.children()[0]));

    }).fail(function (jqxhr,textStatus,errorMsg) {
        console.log(errorMsg);
    });
}

function setQuantityOnHnd(id, code){

    if($('#btnSubmit').text() == "Update"){
        $('#txtQtyOnHand').val(id);
        return;
    }

    if($('#tblOrder tbody tr').length == 0){
        $('#txtQtyOnHand').val(id);
    }else{
        var boolVal = true;
        var preVal = 0;
        for(var i=0; i<$('#tblOrder tbody tr').length; i++){
            if($($($('#tblOrder tbody tr')[i]).children()[0]).text() == code){
                boolVal = false;
                preVal = $($($('#tblOrder tbody tr')[i]).children()[2]).text();
            }
        }
        if(boolVal){
            $('#txtQtyOnHand').val(id);
        }else{
            var mainVal = 0;
            ///////////////////////////////////////////////////////////////////////////////////////////////////
            $.ajax(ajaxConfig).done(function (response) {

                var item = response;

                for (var j = 0; j < item.length; j++) {
                    if (item[j].code == code) {
                        mainVal = item[j].qty;
                    }
                }
                $('#txtQtyOnHand').val(parseInt(mainVal) - parseInt(preVal));
            }).fail(function (jqxhr,textStatus,errorMsg) {
                console.log(errorMsg);
            });
        }
    }
}

function deleteOrderItem(id){
    var redTot = id.parents('tr').children('td:nth-child(5)').text();
    var item = id.parents('tr').children('td:nth-child(1)').text();
    var qt = id.parents('tr').children('td:nth-child(3)').text();
    total = total - redTot;
    $('#txtTotal').val(total);
    id.parents('tr').fadeOut('slow', function () {
        id.parents('tr').remove();
        setItemValues(item);
        for(var i=0; i<itemArray.length; i++){
            if(itemArray[i] == item){
                itemArray.splice(i,1);
                $('#txtQuantity').val("");
                $('#btnSubmit').text("Submit");
            }
        }
        // addQtyOnHand(parseInt(qt),item);
    });

}

$('#txtQuantity').keypress(function () {
    $('#txtQuantity').css('border-color', '#ced4da');
});

$('#btnPlaceOrder').click(function () {
    if($('#tblOrder tbody tr').length == 0){
        alert("Please Order Items First !");
        return;
    }else{

        var arr = [];

        for(var i=0; i<$('#tblOrder tbody tr').length; i++){
            arr.push(
                {
                    itemCode:$($($('#tblOrder tbody tr')[i]).children()[0]).text(),
                    qty:parseInt($($($('#tblOrder tbody tr')[i]).children()[2]).text()),
                    unitPrice:parseFloat($($($('#tblOrder tbody tr')[i]).children()[3]).text())
                }
            );
        }

        var ord = {
            id:parseInt($('#txtOrderId').val().substr(5)),
            date:$('#txtOrderDate').val(),
            customerId:$('#cmbCusId option:selected').text(),
            orderDetails: arr

        };

        var ajaxConfig = {
            method : 'POST',
            url : 'http://localhost:8080/pos/orders',
            async : true,
            data : JSON.stringify(ord),
            contentType : 'application/json'
        };


        $.ajax(ajaxConfig).done(function (response) {
            if(response){
                alert('Order has been saved successfully');
                clearTable();
            }else{
                alert("Failed to save order");
            }
        }).fail(function(jqxhr,textStatus,errorMsg) {
            console.log(errorMsg);
            alert("Failed to save order");
        });

        // alert("Added All Ordered Items");
        clearTable();
    }
});

function clearTable(){
    $('#tblOrder tbody tr').remove();
    itemArray = [];
    total = 0;
    $('#txtTotal').val(0);
}

$('#btnNewOrder').click(function () {
    generateOrderId();
    var id = $('#cmbCusId option:selected').text();
    findName(id);
    var iId = $('#cmbitemCode option:selected').text();
    setItemValues(iId);
    $('#txtTotal').val(0);
});




