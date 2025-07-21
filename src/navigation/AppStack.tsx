import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { JSX } from 'react';
import VisitorDetailScreen from '../screens/visitorScreen/VisitorDetailScreen';
import VisitorsListScreen from '../screens/visitorScreen/VisitorsListScreen';

export type AppStackParamList = {
  Visitors: undefined;
  VisitorDetail: { visitor: { id: string; name: string; email: string; checkinTime: string } };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack(): JSX.Element {
  return (
    <Stack.Navigator initialRouteName="Visitors">
      <Stack.Screen
        name="Visitors"
        component={VisitorsListScreen}
        options={{ title: 'Visitors List' } as NativeStackNavigationOptions}
      />
      <Stack.Screen
        name="VisitorDetail"
        component={VisitorDetailScreen}
        options={{ title: 'Visitor Details' } as NativeStackNavigationOptions}
      />
    </Stack.Navigator>
  );
}