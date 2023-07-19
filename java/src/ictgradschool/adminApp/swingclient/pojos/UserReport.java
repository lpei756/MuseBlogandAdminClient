package ictgradschool.adminApp.swingclient.pojos;

import java.util.*;

public class UserReport {

    private final List<User> _reportIndex;
    private Map<Integer,User>  _report;

    private List<UserReportListener> _listeners;

    public UserReport(){
        _reportIndex= new ArrayList<>();
    }


    public UserReport(List<User> userList){

        this._reportIndex = userList;

        _report = new HashMap<>();

        for(User user : _reportIndex) {
            _report.put(user.getUserID(), user);
        }

        _listeners = new ArrayList<>();

    }

    public int getNumberOfUsers(){ return _reportIndex.size();}

    public User getUserAt(int index){return _reportIndex.get(index);}

    public int getIndexFor(User user){return  _reportIndex.indexOf(user);}

    public void addUserReportListener(UserReportListener listener){
        _listeners.add(listener);
    }


    //wipe user's info and notify all the listeners about the deleted user.
    public void changeDeletedUserInfo(int userID){
        Iterator<User> iterator = _reportIndex.iterator();

        while (iterator.hasNext()) {
            User user = iterator.next();
            if (user.getUserID() == userID) {
                // Notify listeners before removing the user
                for(UserReportListener listener: _listeners){
                    listener.userDeleted(userID);
                }

                // Remove user from the list
                iterator.remove();

                // Remove user from the map
                _report.remove(userID);

                break;
            }
        }
    }


}
