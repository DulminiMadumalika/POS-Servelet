package lk.ijse.pos;

import lk.ijse.pos.db.DBConnection;
import org.apache.commons.dbcp2.BasicDataSource;

import javax.json.*;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet(urlPatterns = "/orders/*")
public class OrderServelet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        try {
            ServletInputStream is = req.getInputStream();
            JsonReader reader = Json.createReader(is);
            JsonObject order = reader.readObject();

            int orderId = order.getInt("id");
            String date = order.getString("date");
            String customerId = order.getString("customerId");
            JsonArray orderDetails = order.getJsonArray("orderDetails");

            Connection connection = null;

            try {
                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                connection = dbpool.getConnection();

                if (date == null || customerId == null || orderDetails.size() == 0) {
                    resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
                } else {
                    PreparedStatement pstm = connection.prepareStatement("INSERT INTO `order` VALUES (?,?,?)");
                    pstm.setObject(1, orderId);
                    pstm.setObject(2, date);
                    pstm.setObject(3, customerId);

                    connection.setAutoCommit(false);
                    boolean b = pstm.executeUpdate() > 0;

                    if (!b) {
                        connection.rollback();
                        out.println("false");
                        return;
                    }

                    for (int i = 0; i < orderDetails.size(); i++) {

                        JsonObject orderDet = orderDetails.get(i).asJsonObject();
                        String itemCode = orderDet.getString("itemCode");
                        int qty = orderDet.getInt("qty");
                        double unitPrice = orderDet.getJsonNumber("unitPrice").doubleValue();

                        PreparedStatement pst = connection.prepareStatement("INSERT INTO orderdetail VALUES(?,?,?,?)");
                        pst.setObject(1, itemCode);
                        pst.setObject(2, orderId);
                        pst.setObject(3, qty);
                        pst.setObject(4, unitPrice);

                        boolean bool = pst.executeUpdate() > 0;

                        if (bool) {

                            PreparedStatement pstmGet = connection.prepareStatement("SELECT qtyOnHand FROM item WHERE code=?");
                            pstmGet.setObject(1, itemCode);
                            ResultSet rst = pstmGet.executeQuery();

                            if (rst.next()) {
                                PreparedStatement pstmUpdate = connection.prepareStatement("UPDATE item SET qtyOnHand=? WHERE code=?");
                                pstmUpdate.setObject(1, Integer.parseInt(rst.getString("qtyOnHand")) - qty);
                                pstmUpdate.setObject(2, itemCode);
                                boolean boo = pstmUpdate.executeUpdate() > 0;

                                if (!boo) {
                                    connection.rollback();
                                    out.println("false");
                                    return;
                                }
                            }
                        } else {
                            connection.rollback();
                            out.println("false");
                            return;
                        }
                    }
                    out.println("true");
                    connection.setAutoCommit(true);
                }
            } catch (Exception e){
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                e.printStackTrace();
                try {
                    connection.rollback();
                } catch (SQLException e1) {
                    e1.printStackTrace();
                }

            }finally {
                try {
                    connection.setAutoCommit(true);
                    connection.close();
                    out.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String pathInfo = req.getPathInfo();
        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                Connection connection = DBConnection.getInstance().getConnection();
                PreparedStatement pst = connection.prepareStatement("SELECT o.id, o.date, o.customerId,c.name FROM `order` o INNER JOIN customer c on o.customerId = c.id");
                ResultSet rst = pst.executeQuery();

                JsonArrayBuilder ab = Json.createArrayBuilder();
                JsonObjectBuilder ob = Json.createObjectBuilder();
                JsonArrayBuilder orderDet = Json.createArrayBuilder();

                while (rst.next()){
                    ob.add("oid",rst.getInt("id"))
                            .add("date",rst.getString("date"))
                            .add("customerId",rst.getString("customerId"))
                            .add("name",rst.getString("name"));

                    PreparedStatement pstOrder = connection.prepareStatement("SELECT od.itemCode, od.unitPrice, od.orderId, od.qty, it.description FROM orderdetail od INNER JOIN item it ON od.itemCode = it.code WHERE orderId=?");
                    pstOrder.setObject(1,rst.getInt("id"));
                    ResultSet rsto = pstOrder.executeQuery();

                    while (rsto.next()){
                        orderDet.add(
                                Json.createObjectBuilder().add("itemcode",rsto.getString("itemCode"))
                                .add("orderId",rsto.getInt("orderId"))
                                .add("qty",rsto.getInt("qty"))
                                .add("unitPrice",rsto.getDouble("unitPrice"))
                                .add("description",rsto.getString("description"))
                                .build()
                        );
                    }
                    ob.add("orderDetails",orderDet);
                    ab.add(ob.build());
                }
                out.println(ab.build());
            }else{
                String oid = pathInfo.replaceAll("/", "");

                Connection connection = DBConnection.getInstance().getConnection();
                PreparedStatement pst = connection.prepareStatement("SELECT o.id, o.date, o.customerId,c.name FROM `order` o INNER JOIN customer c on o.customerId=c.id WHERE o.id=?");
                pst.setObject(1,oid);
                ResultSet rst = pst.executeQuery();

                JsonObjectBuilder ob = Json.createObjectBuilder();
                JsonArrayBuilder orderDet = Json.createArrayBuilder();

                if(rst.next()){
                    ob.add("oid",rst.getInt("id"))
                            .add("date",rst.getString("date"))
                            .add("customerId",rst.getString("customerId"))
                            .add("name",rst.getString("name"));

                    PreparedStatement pstOrder = connection.prepareStatement("SELECT od.itemCode, od.unitPrice, od.orderId, od.qty, it.description FROM orderdetail od INNER JOIN item it ON od.itemCode = it.code WHERE orderId=?");
                    pstOrder.setObject(1,rst.getInt("id"));
                    ResultSet rsto = pstOrder.executeQuery();

                    while (rsto.next()){
                        orderDet.add(
                                Json.createObjectBuilder().add("itemcode",rsto.getString("itemCode"))
                                        .add("orderId",rsto.getInt("orderId"))
                                        .add("qty",rsto.getInt("qty"))
                                        .add("unitPrice",rsto.getDouble("unitPrice"))
                                        .add("description",rsto.getString("description"))
                                        .build()
                        );
                    }
                    ob.add("orderDetails",orderDet);
                }
                out.println(ob.build().toString());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        String pathInfo = req.getPathInfo();
        Connection connection = null;

        try {
            BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
            connection = dbpool.getConnection();

            if(pathInfo == null || pathInfo.equals("/")){
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            }else{
                PreparedStatement pstm = connection.prepareStatement("DELETE FROM orderdetail WHERE orderId=?");
                pstm.setObject(1,pathInfo.replaceAll("/",""));

                connection.setAutoCommit(false);

                boolean b = pstm.executeUpdate()>0;
                if(b){
                    PreparedStatement pst = connection.prepareStatement("DELETE FROM `order` WHERE id=?");
                    pst.setObject(1,pathInfo.replaceAll("/",""));

                    if(pst.executeUpdate()>0){
                        connection.setAutoCommit(true);
                        resp.sendError(200);
                    }else{
                        connection.rollback();
                        resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
                    }
                }
                connection.setAutoCommit(true);
            }

        }catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }finally {
            try {
                connection.setAutoCommit(true);
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
