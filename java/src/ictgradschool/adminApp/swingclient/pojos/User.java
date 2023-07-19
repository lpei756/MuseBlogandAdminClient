package ictgradschool.adminApp.swingclient.pojos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class User {

    @JsonProperty("User_ID")
    private int UserID;
    @JsonProperty("Username")
    private String Username;
    @JsonProperty("Real_Name")
    private String RealName;
    @JsonProperty("Date_Of_Birth")
    private String DateOfBirth;
    @JsonProperty("Brief_Description")
    private String BriefDescription;
    @JsonProperty("Avatar")
    private String Avatar;

    @JsonProperty("NumberOfArticles")
    private int NumberOfArticles;

    @JsonProperty("User_ID")
    public int getUserID() {
        return UserID;
    }

    @JsonProperty("User_ID")
    public void setUserID(int UserID) {
        this.UserID = UserID;
    }

    @JsonProperty("Username")
    public String getUsername() {
        return Username;
    }

    @JsonProperty("Username")
    public void setUsername(String Username) {
        this.Username = Username;
    }

    @JsonProperty("Real_Name")
    public String getRealName() {
        return RealName;
    }

    @JsonProperty("Real_Name")
    public void setRealName(String RealName) {
        this.RealName = RealName;
    }


    @JsonProperty("Date_Of_Birth")
    public String getDateOfBirth() {
        return DateOfBirth;
    }

    @JsonProperty("Date_Of_Birth")
    public void setDateOfBirth(String DateOfBirth) {
        this.DateOfBirth = DateOfBirth;
    }

    @JsonProperty("Brief_Description")
    public String getBriefDescription() {
        return BriefDescription;
    }

    @JsonProperty("Brief_Description")
    public void setBriefDescription(String BriefDescription) {
        this.BriefDescription = BriefDescription;
    }

    @JsonProperty("Avatar")
    public String getAvatar() {
        return Avatar;
    }

    @JsonProperty("Avatar")
    public void setAvatar(String Avatar) {
        this.Avatar = Avatar;
    }



    @JsonProperty("NumberOfArticles")
    public int getNumberOfArticles() {
        return NumberOfArticles;
    }

    @JsonProperty("NumberOfArticles")
    public void setNumberOfArticles(int NumberOfArticles) {
        this.NumberOfArticles = NumberOfArticles;
    }

    @Override
    public String toString() {
        return "User{" +
                "UserID=" + UserID +
                ", Username='" + Username + '\'' +
                ", RealName='" + RealName + '\'' +
                ", DateOfBirth='" + DateOfBirth + '\'' +
                ", Brief_Description='" + BriefDescription+ '\'' +
                ", Avatar='" + Avatar + '\'' +
                ", NumberOfArticles=" + NumberOfArticles +
                '}';
    }

}
