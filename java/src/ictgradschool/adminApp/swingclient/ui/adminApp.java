package ictgradschool.adminApp.swingclient.ui;

import ictgradschool.adminApp.swingclient.pojos.User;
import ictgradschool.adminApp.swingclient.pojos.UserReport;
import ictgradschool.adminApp.swingclient.pojos.TableModelAdapter;
import ictgradschool.adminApp.swingclient.web.API;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.concurrent.ExecutionException;
import java.util.List;

public class adminApp extends javax.swing.JFrame {

    JScrollPane scrollPaneForTable;
    JButton loginBtn;
    JButton logoutBtn;
    JButton deleteBtn;
    JTextField usernameInput;
    JPasswordField passwordInput;
    JLabel usernameLabel;
    JLabel passwordLabel;
    TableModelAdapter adapter;
    JTable tableView;
    int targetUserID;
    UserReport userReport;
    String adminUsername;
    String adminPassword;


    public adminApp() {

        //Create all the components
        initComponents();

        //add listeners to the buttons
        loginBtn.addActionListener(this::handleBtnChangeClick);
        logoutBtn.addActionListener(this::handleBtnChangeClick);
        deleteBtn.addActionListener(this::handleBtnChangeClick);
    }

    private void initComponents() {

        //set up the frame size
        this.setPreferredSize(new Dimension(800, 700));

        //set up the GUI
        // Create the login/logout buttons.
        loginBtn = new JButton("Log in");
        //loginBtn.setPreferredSize(new Dimension(60,20));
        logoutBtn = new JButton("Log out");
        //logoutBtn.setPreferredSize(new Dimension(60,20));
        logoutBtn.setEnabled(false);
        deleteBtn = new JButton("Delete User");
        //deleteBtn.setPreferredSize(new Dimension(60,20));
        deleteBtn.setEnabled(false);

        //create the username and password input field
        usernameInput = new JTextField();
        passwordInput = new JPasswordField();
        usernameLabel = new JLabel("Username:");
        passwordLabel = new JLabel("Password:");

        // Layout the GUI using intermediate containers, layout managers and
        // scrollbars as appropriate.
        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new BoxLayout(buttonPanel, BoxLayout.X_AXIS));
        buttonPanel.setPreferredSize(new Dimension(this.getWidth(), 30));
        buttonPanel.add(loginBtn);
        buttonPanel.add(logoutBtn);
        buttonPanel.add(deleteBtn);

        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new GridLayout(5, 2));
        inputPanel.add(usernameLabel);
        inputPanel.add(usernameInput);
        inputPanel.add(passwordLabel);
        inputPanel.add(passwordInput);

        JPanel controlPanel = new JPanel();
        controlPanel.setLayout(new BoxLayout(controlPanel, BoxLayout.Y_AXIS));
        controlPanel.setPreferredSize(new Dimension(this.getWidth(), 150));
        controlPanel.add(buttonPanel);
        controlPanel.add(inputPanel);

        scrollPaneForTable = new JScrollPane();
        adapter = new TableModelAdapter(new UserReport());
        tableView = new JTable();
        tableView.setModel(adapter);
        scrollPaneForTable.setViewportView(tableView);
        scrollPaneForTable.setVerticalScrollBarPolicy(ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED);

        JComponent contentPanel = new JPanel();
        contentPanel.setLayout(new BorderLayout());
        contentPanel.add(scrollPaneForTable, BorderLayout.CENTER);
        contentPanel.add(controlPanel, BorderLayout.SOUTH);

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.add(contentPanel);

        // Display the window.
        this.pack();
        this.setLocationRelativeTo(null);
        this.setVisible(true);
    }

    //depends on the action, call different SwingWorker
    private void handleBtnChangeClick(ActionEvent e) {
        if(e.getSource()==loginBtn){
            new loginSwingWorker().execute();
        } else if (e.getSource()==logoutBtn){
            new logoutSwingWorker().execute();
        } else if (e.getSource()==deleteBtn){
            new deleteUserSwingWorker().execute();
        }
    }

    //general function to set button and table to original
    private void resetToOriginal(){
        adapter = new TableModelAdapter(new UserReport());
        tableView = new JTable();
        tableView.setModel(adapter);
        scrollPaneForTable.setViewportView(tableView);
        usernameInput.setText("");
        passwordInput.setText("");
        adminPassword="";
        adminUsername="";
        logoutBtn.setEnabled(false);
        loginBtn.setEnabled(true);
        deleteBtn.setEnabled(false);
    }

    private class logoutSwingWorker extends SwingWorker<Integer, Void> {
        @Override
        protected Integer doInBackground() throws Exception {
           logoutBtn.setEnabled(false);
           return API.getInstance().userLogout();
        }

        @Override
        protected void done() {
            int statusCode = 0;
            try {
                statusCode=get();
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
                resetToOriginal();
            }
            if(statusCode == 401){
                JOptionPane.showMessageDialog(scrollPaneForTable,
                        "Something Wrong! You are not logged out",
                        "Warning",
                        JOptionPane.ERROR_MESSAGE);
            } else if(statusCode == 204){
                JOptionPane.showMessageDialog(scrollPaneForTable,
                        "You have been logged out!");
                resetToOriginal();
            }
        }
    }

    private class loginSwingWorker extends SwingWorker<Integer, Void> {

        public loginSwingWorker() {
            loginBtn.setEnabled(false);
            adminUsername = adminApp.this.usernameInput.getText();
            adminPassword = new String(adminApp.this.passwordInput.getPassword());
        }

        @Override
        protected Integer doInBackground() throws Exception {
            return API.getInstance().userLogin(adminUsername, adminPassword);
        }

        @Override
        protected void done() {
            int statusCode = 0;
            try {
                statusCode  = get();
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
                resetToOriginal();
            }
            if(statusCode == 401){
                JOptionPane.showMessageDialog(scrollPaneForTable,
                        "Your username and password are wrong!",
                        "Warning",
                        JOptionPane.ERROR_MESSAGE);
                loginBtn.setEnabled(true);
            } else if(statusCode == 204){
                JOptionPane.showMessageDialog(scrollPaneForTable,
                        "You have logged in!");
                logoutBtn.setEnabled(true);
                new RetrieveUserReportSwingWorker().execute();
            }
        }
    }

    private class RetrieveUserReportSwingWorker extends SwingWorker<List<User>, Void> {
        @Override
        protected List<User> doInBackground() throws Exception {
            return API.getInstance().retrieveUserReport();
        }
        @Override
        protected void done() {
            List<User> response = new ArrayList<>();
            try {
                response = get();
            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
                resetToOriginal();
            }
            if (response.size()==0){
                JOptionPane.showMessageDialog(scrollPaneForTable,
                        "Error, users could not be retrieved! You will be logged out!",
                        "Warning",
                        JOptionPane.ERROR_MESSAGE);
                loginBtn.setEnabled(true);
                new logoutSwingWorker().execute();
            } else {

                // Create an Adapter that allows the UserReport to serve as a model
                // for the JTable. Connect the JTable to the Adapter, and connect the
                // Adapter to the UserReport.
                userReport = new UserReport(response);
                adapter = new TableModelAdapter(userReport);
                tableView = new JTable();
                tableView.setModel(adapter);
                scrollPaneForTable.setViewportView(tableView);

                // Register the Adapter as a Listener on the userReport. Whenever a
                // user in the userReport changes, the JTable view should be updated.
                userReport.addUserReportListener(adapter);


                tableView.addMouseListener(new MouseAdapter() {
                    @Override
                    public void mouseClicked(MouseEvent e) {
                        deleteBtn.setEnabled(true);
                        int selectedRow = tableView.getSelectedRow();
                        targetUserID = (int)adapter.getValueAt(selectedRow,0);
                    }
                });
            }
        }
    }

    private class deleteUserSwingWorker extends SwingWorker<Integer, Void> {
        @Override
        protected Integer doInBackground() throws Exception {
            return API.getInstance().deleteUser(targetUserID);
        }

        @Override
        protected void done() {
            int statusCode;
            try {
                statusCode = get();
                if(statusCode ==204){
                    userReport.changeDeletedUserInfo(targetUserID);
                    adapter.fireTableDataChanged();
                    JOptionPane.showMessageDialog(scrollPaneForTable,
                            "user deleted!");
                } else if (statusCode ==401){
                    JOptionPane.showMessageDialog(scrollPaneForTable,
                            "Something Wrong! User deletion failed!",
                            "Warning",
                            JOptionPane.ERROR_MESSAGE);
                }

            } catch (InterruptedException | ExecutionException e) {
                e.printStackTrace();
                resetToOriginal();
            }
        }
    }
}
