package ictgradschool.adminApp.swingclient;

import ictgradschool.adminApp.swingclient.ui.adminApp;

import javax.swing.*;

public class Main {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(adminApp::new);
    }
}
