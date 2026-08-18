import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AddTodo from './components/addTodo';
import Card from './components/card';
import { Todo } from './todo';

export default function Index() {
  const db     = useSQLiteContext();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);

  const getTodos = async () => {
    try {
      const results = await db.getAllAsync<Todo>(
        `SELECT * FROM todos ORDER BY
           CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,
           due_date ASC,
           id DESC`
      );
      setTodos(results);
    } catch {
      Alert.alert('Cannot read todos.');
    }
  };

  useEffect(() => { getTodos(); }, []);

  return (
    <ImageBackground
      source={require('./images/bgforhomepage.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* ── Title row ── */}
        <View style={styles.titleRow}>
          <Text style={styles.heading}>My Todo List</Text>
        </View>

        {/* ── Add form (glass box) ── */}
        <AddTodo refresh={getTodos} />

        {/* ── Todo list ── */}
        <FlatList
          style={styles.list}
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Card todo={item} refresh={getTodos} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="favorite-border" size={52} color="#9aba63" />
              <Text style={styles.emptyText}>
                No todos yet!{'\n'}Add one above ✨
              </Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 110 }}
        />

        {/* ── FAB – go to Calendar ── */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => (router.push as any)('/calendar')}
          activeOpacity={0.85}
        >
          <MaterialIcons name="event" size={30} color="#f4f2ed" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(49, 62, 27, 0.58)',
  },

  /* Title */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: 18,
    paddingBottom: 10,
  },
  heading: {
    fontFamily: 'PlaywriteDELAGuides_400Regular',
    fontSize: 24,
    color: '#f4f2ed',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },

  /* List */
  list: { width: '95%', alignSelf: 'center' },

  /* Empty state */
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 22,
    color: '#dfe9ce',
    textAlign: 'center',
  },

  /* Floating Action Button */
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#556b2f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(154,186,99,0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 10,
  },
});
