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

import static java.lang.System.out;

@WebServlet(urlPatterns = "/items/*")
public class ItemServelet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        String pathInfo = req.getPathInfo();

        System.out.println(pathInfo);

        if(pathInfo == null || pathInfo.equals("/")){
            try {
                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                Connection connection = dbpool.getConnection();
                PreparedStatement pst = connection.prepareStatement("SELECT * FROM item");
                ResultSet rst = pst.executeQuery();

                JsonArrayBuilder ab = Json.createArrayBuilder();

                while (rst.next()){
                    String code = rst.getString("code");
                    String description = rst.getString("description");
                    int qty = rst.getInt("qtyOnHand");
                    double unitPrice = rst.getDouble("unitPrice");

                    ab.add(Json.createObjectBuilder().add("code",code)
                            .add("description",description)
                            .add("qty",qty)
                            .add("unitPrice",unitPrice)
                            .build());
                }

                out.println(ab.build().toString());
                connection.close();
            } catch (Exception e) {
                e.printStackTrace();
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            } finally {
                out.close();
            }
        }else{
            String newPathInfo = pathInfo.replaceAll("/", "");

            try {
                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                Connection connection = dbpool.getConnection();
                PreparedStatement pst = connection.prepareStatement("SELECT * FROM item WHERE code=?");
                pst.setObject(1,newPathInfo);
                ResultSet rst = pst.executeQuery();

                JsonObjectBuilder ob = Json.createObjectBuilder();

                if (rst.next()){

                    String code = rst.getString("code");
                    String description = rst.getString("description");
                    int qty = rst.getInt("qtyOnHand");
                    double unitPrice = rst.getDouble("unitPrice");

                    ob.add("code",code)
                            .add("description",description)
                            .add("qty",qty)
                            .add("unitPrice",unitPrice);

                    out.println(ob.build().toString());

                }else{
                    resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
                }

                connection.close();

            } catch (Exception e) {
                e.printStackTrace();
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            } finally {
                out.close();
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        ServletInputStream is = req.getInputStream();
        JsonReader reader = Json.createReader(is);
        JsonObject item = reader.readObject();

        try{
            String code = item.getString("code");
            String description = item.getString("description");
            int qty = item.getInt("qty");
            double unitPrice = item.getJsonNumber("unitPrice").doubleValue();

            if(code == null || description == null){
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            }else{
                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                Connection connection = dbpool.getConnection();
                PreparedStatement pst = connection.prepareStatement("INSERT INTO item VALUES (?,?,?,?)");
                pst.setObject(1,code);
                pst.setObject(2,description);
                pst.setObject(3,qty);
                pst.setObject(4,unitPrice);

                boolean b = pst.executeUpdate()>0;

                if(b){
                    out.println("true");
                }else{
                    out.println("false");
                }
                connection.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } finally {
            out.close();
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String pathInfo = req.getPathInfo();

        if(pathInfo == null || pathInfo.equals("/")){
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }else{

            ServletInputStream is = req.getInputStream();
            JsonReader reader = Json.createReader(is);
            JsonObject item = reader.readObject();

            try{
                String code = pathInfo.replaceAll("/", "");
                String description = item.getString("description");
                int qty = item.getInt("qty");
                double unitPrice = item.getJsonNumber("unitPrice").doubleValue();

                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                Connection connection = dbpool.getConnection();
                PreparedStatement pst = connection.prepareStatement("UPDATE item SET description=?, qtyOnHand=?, unitPrice=? WHERE code=?");
                pst.setObject(4,code);
                pst.setObject(1,description);
                pst.setObject(2, qty);
                pst.setObject(3,unitPrice);

                boolean bool = pst.executeUpdate()>0;

                PrintWriter out = resp.getWriter();

                if(bool){
                    out.println("true");
                }else{
                    out.println("false");
                }

                connection.close();

            } catch (Exception e) {
                e.printStackTrace();
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if(pathInfo == null || pathInfo.equals("/")){
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }else{
            try {

                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                Connection connection = dbpool.getConnection();
                PreparedStatement pst = connection.prepareStatement("DELETE FROM item WHERE code=?");
                pst.setObject(1,pathInfo.replaceAll("/",""));

                boolean b = pst.executeUpdate()>0;
                PrintWriter out = resp.getWriter();

                if(b){
                    out.println("true");
                }else{
                    out.println("false");
                }
                connection.close();
            }catch (Exception e) {
                e.printStackTrace();
                resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }finally {
                out.close();
            }
        }
    }
}
