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
import java.sql.*;

@WebServlet(urlPatterns = "/customers/*")
public class CustomerServelet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        String pathInfo = req.getPathInfo();

        try{

            BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
            Connection connection = dbpool.getConnection();

            if( pathInfo == null || pathInfo.equals("/")) {

                Statement stm = connection.createStatement();
                ResultSet rst = stm.executeQuery("SELECT * FROM customer");

                JsonArrayBuilder ab = Json.createArrayBuilder();
                while (rst.next()) {
                    String id = rst.getString("id");
                    String name = rst.getString("name");
                    String address = rst.getString("address");

                    ab.add(Json.createObjectBuilder()
                            .add("id", id)
                            .add("name", name)
                            .add("address", address)
                            .build()
                    );
                }
                out.println(ab.build().toString());
            }else{

                String newPathInfo = pathInfo.replaceAll("/", "");
                PreparedStatement pst = connection.prepareStatement("SELECT * FROM customer WHERE id=?");
                pst.setObject(1,newPathInfo);
                ResultSet rst = pst.executeQuery();

                JsonObjectBuilder ob =  Json.createObjectBuilder();

                if(rst.next()){
                    String id = rst.getString("id");
                    String name = rst.getString("name");
                    String address = rst.getString("address");

                    ob.add("id",id)
                            .add("name",name)
                            .add("address",address);

                    out.println(ob.build().toString());

                }else{
                    resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                }

            }
            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }finally {
            out.close();
        }

    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        resp.setContentType("application/json");

        ServletInputStream is = req.getInputStream();
        JsonReader reader = Json.createReader(is);
        JsonObject customer = reader.readObject();

        String id =customer.getString("id");
        String name = customer.getString("name");
        String address = customer.getString("address");

        if(id == null || name == null || address == null){
            resp.sendError(400);
        }else{
            try {
                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                Connection connection = dbpool.getConnection();
                PreparedStatement pst = connection.prepareStatement("INSERT INTO customer VALUES(?,?,?)");
                pst.setObject(1,id);
                pst.setObject(2,address);
                pst.setObject(3,name);

                boolean bool =  pst.executeUpdate()>0;
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
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        String pathInfo = req.getPathInfo();
        if(pathInfo == null || pathInfo.equals("/")){
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }else{

            ServletInputStream is = req.getInputStream();
            JsonReader reader = Json.createReader(is);
            JsonObject cust = reader.readObject();

            String id = pathInfo.replaceAll("/","");
            String name = cust.getString("name");
            String address = cust.getString("address");

            if(id == null || name == null || address == null){
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
            }else{
                try {
                    BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                    Connection connection = dbpool.getConnection();
                    PreparedStatement pst = connection.prepareStatement("UPDATE customer SET name=?, address=? WHERE id=?");
                    pst.setObject(1,name);
                    pst.setObject(2,address);
                    pst.setObject(3,id);

                    boolean b = pst.executeUpdate()>0;

                    if(b){
                        out.println(true);
                    }else{
                        out.println(false);
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
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/jason");

        String pathInfo = req.getPathInfo();

        if(pathInfo == null || pathInfo.equals("/")){
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }else{
            try {
                BasicDataSource dbpool = (BasicDataSource) getServletContext().getAttribute("dbpool");
                Connection connection = dbpool.getConnection();
                PreparedStatement pst = connection.prepareStatement("DELETE FROM customer WHERE id=?");
                pst.setObject(1,pathInfo.replaceAll("/",""));
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
}
