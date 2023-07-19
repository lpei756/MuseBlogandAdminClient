package ictgradschool.adminApp.swingclient.pojos;

import javax.swing.table.AbstractTableModel;

public class TableModelAdapter extends AbstractTableModel implements UserReportListener {
    private static final String[]  COLUMN_NAMES = { "UserID", "Username", "RealName", "DateOfBirth", "BriefDescription","Avatar",  "NumberOfArticles"};
    private final UserReport adapter;

    public TableModelAdapter(UserReport userReport){
        adapter = userReport;
    }

    @Override
    public int getRowCount() {
        return adapter.getNumberOfUsers();
    }

    @Override
    public int getColumnCount() {
        return COLUMN_NAMES.length;
    }

    @Override
    public String getColumnName(int index) {
        return COLUMN_NAMES[index];
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        User user = adapter.getUserAt(rowIndex);
        Object result = null;
        if (user == null) {
            return null;
        }

        switch (columnIndex){
            case 0:
                result = user.getUserID();
                break;
            case 1:
                result = user.getUsername();
                break;
            case 2:
                result = user.getRealName();
                break;
            case 3:
                result = user.getDateOfBirth();
                break;
            case 4:
                result = user.getBriefDescription();
                break;
            case 5:
                result = user.getAvatar();
                break;

            case 6:
                result = user.getNumberOfArticles();
                break;
        }

        return result;
    }
    @Override
    public void update(User user) {
        // Fire a TableModelEvent so that the JTable view can update the row
        // used to display the user object that has changed.
        int rowIndex = adapter.getIndexFor(user);
        if (rowIndex == -1) {
            return;
        }
        fireTableRowsUpdated(rowIndex,rowIndex);
    }
    @Override
    public void userDeleted(int userID) {
        // Fire a TableModelEvent so that the JTable view can update to reflect the removed user
        fireTableDataChanged();
    }

}
