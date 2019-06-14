package lk.ijse.pos;

import org.apache.commons.dbcp2.BasicDataSource;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class MyServeletListner implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {

        BasicDataSource bds = new BasicDataSource();

        bds.setDriverClassName("com.mysql.jdbc.Driver");
        bds.setUsername("root");
        bds.setPassword("mysql");
        bds.setUrl("jdbc:mysql://localhost:3307/jdbc");

        bds.setMaxTotal(10);
        bds.setInitialSize(10);
        bds.setMaxIdle(10);

        sce.getServletContext().setAttribute("dbpool",bds);

    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {

    }
}
