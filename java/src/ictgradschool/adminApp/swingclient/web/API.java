package ictgradschool.adminApp.swingclient.web;

import ictgradschool.adminApp.swingclient.pojos.User;
import ictgradschool.adminApp.swingclient.util.JSONUtils;

import java.io.IOException;
import java.net.*;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

public class API {
    private static API instance;

    private static final String BASE_URL = "http://localhost:3000/api";

    public static API getInstance() {
        if (instance == null) {
            System.out.println("Creating new API instance...");
            instance = new API();
        }
        return instance;
    }

    private final CookieManager cookieManager;
    private final HttpClient client;

    private API() {
        System.out.println("Initializing API...");
        this.cookieManager = new CookieManager();

        this.client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(1))
                .cookieHandler(this.cookieManager)
                .build();
    }

    //check user login status and return the status code
    public int userLogin(String username, String password) throws IOException, InterruptedException {

        System.out.println("Attempting to login user...");

        Map<String, String> loginInfo = new HashMap<>();
        loginInfo.put("username", username);
        loginInfo.put("password", password);

        System.out.println("User login info: " + loginInfo);

        String json = JSONUtils.toJSON(loginInfo);

        System.out.println("JSON formatted login info: " + json);

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/user_login"))
                .setHeader("Content-Type", "application/json")
                .setHeader("Accept", "application/json")
                .method("POST", HttpRequest.BodyPublishers.ofString(json));

        HttpRequest request = builder.build();

        System.out.println("Login request built: " + request.toString());

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Response received: " + response.toString());
        System.out.println("Login response code: " + response.statusCode());
        System.out.println("Login response body: " + response.body());

        return response.statusCode();
    }

    //check user logout status and return the status code
    public Integer userLogout() throws  IOException, InterruptedException {

        System.out.println("Attempting to logout user...");
        String authToken = getAuthToken();
        System.out.println("Using authToken: " + authToken);

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/logout"))
                .setHeader("Accept", "application/json")
                .setHeader("Authorization", "Bearer " + authToken)
                .method("GET", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = builder.build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Logout response code: " + response.statusCode());

        return response.statusCode();
    }

    public String getAuthToken() {
        System.out.println("Getting authToken...");
        List<HttpCookie> cookies = this.cookieManager.getCookieStore().get(URI.create(BASE_URL));
        System.out.println("Cookies: " + cookies);
        for (HttpCookie cookie : cookies) {
            System.out.println("Inspecting cookie: " + cookie.toString());

            if (cookie.getName().equals("authToken")) {
                System.out.println("Found authToken: " + cookie.getValue());
                return cookie.getValue();
            }
        }
        System.out.println("authToken not found...");
        return "";
    }

    //get user report, return list of user depends on the status code
    public List<User> retrieveUserReport() throws IOException, InterruptedException {
        System.out.println("Retrieving user report...");

        String authToken = getAuthToken();
        System.out.println("Using authToken: " + authToken);

        int responseStatusCode;
        List<User> userList;
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/users"))
                .setHeader("Accept", "application/json")
                .setHeader("Authorization", "Bearer " + authToken)
                .method("GET", HttpRequest.BodyPublishers.noBody());
        System.out.println("Builder for the request created: " + builder.toString());

        HttpRequest request = builder.build();
        System.out.println("Request built: " + request.toString());

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Response received: " + response.toString());

        responseStatusCode = response.statusCode();
        System.out.println("Response code for user report: " + responseStatusCode);

        if(responseStatusCode==401){
            System.out.println("Unauthorized response code received. Creating empty user list.");
            userList= new ArrayList<>();
        } else {
            String responseJson = response.body();
            System.out.println("Response body: " + responseJson);
            userList = JSONUtils.toList(responseJson, User.class);
            System.out.println("User list parsed: " + userList.toString());
        }
        return userList;
    }

    //delete user and return status code
    public Integer deleteUser(int targetUserID) throws IOException, InterruptedException {

        System.out.println("Attempting to delete user with ID: " + targetUserID);

        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/users/"+targetUserID))
                .setHeader("Accept", "application/json")
                .method("DELETE", HttpRequest.BodyPublishers.noBody());

        HttpRequest request = builder.build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Delete user response code: " + response.statusCode());

        return response.statusCode();
    }
}