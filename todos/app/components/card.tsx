import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Todo } from '../todo';
import EditTodoModal from './editTodoModal';

interface CardProps {
  todo: Todo;
  refresh: () => void;
}

export default function Card({ todo, refresh }: CardProps) {
  const db = useSQLiteContext();
  const [isEditing, setIsEditing] = useState(false);

  /* ── Toggle completed ── */
  const toggleCompleted = async () => {
    try {
      await db.runAsync('UPDATE todos SET completed = ? WHERE id = ?', [
        todo.completed ? 0 : 1,
        todo.id,
      ]);
      refresh();
    } catch (err: any) {
      Alert.alert(err.message);
    }
  };

  /* ── Delete ── */
  const removeTodo = async () => {
    Alert.alert(
      'Delete Todo',
      `Delete "${todo.title}"?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM todos WHERE id = ?', [todo.id]);
              refresh();
            } catch (err: any) {
              Alert.alert(err.message);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  /* ── Helpers ── */
  const isOverdue =
    !!todo.due_date && !todo.completed && new Date(todo.due_date) < new Date();

  const formatDue = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <View
      style={[
        styles.container,
        todo.completed ? styles.cardDone : styles.cardActive,
        isOverdue && styles.cardOverdue,
      ]}
    >
      {/* ── Favorite icon (toggle) ── */}
      <TouchableOpacity onPress={toggleCompleted} style={styles.favBtn}>
        <MaterialIcons
          name={todo.completed ? 'favorite' : 'favorite-border'}
          size={27}
          color={todo.completed ? '#9aba63' : '#dfe9ce'}
        />
      </TouchableOpacity>

      {/* ── Content ── */}
      <View style={styles.content}>
        <Text style={[styles.title, !!todo.completed && styles.titleDone]} numberOfLines={2}>
          {todo.title}
        </Text>

        {/* Due date */}
        {todo.due_date && (
          <View style={styles.metaRow}>
            <MaterialIcons
              name="schedule"
              size={13}
              color={isOverdue ? '#ff9999' : '#c2d5a1'}
            />
            <Text style={[styles.metaText, isOverdue && styles.overdueText]}>
              {'  '}
              {formatDue(todo.due_date)}
              {isOverdue && '  ⚠️'}
            </Text>
          </View>
        )}

        {/* Notes preview */}
        {todo.notes && (
          <View style={styles.metaRow}>
            <MaterialIcons name="notes" size={13} color="#b7ad88" />
            <Text style={styles.notesText} numberOfLines={1}>
              {'  '}
              {todo.notes}
            </Text>
          </View>
        )}
      </View>

      {/* ── Actions (Edit/Delete) ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionBtn}>
          <MaterialIcons name="edit" size={21} color="rgba(244,242,237,0.7)" />
        </TouchableOpacity>
        <TouchableOpacity onPress={removeTodo} style={styles.actionBtn}>
          <MaterialIcons name="delete-outline" size={23} color="rgba(255,160,160,0.8)" />
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      {isEditing && (
        <EditTodoModal
          todo={todo}
          visible={isEditing}
          onClose={() => setIsEditing(false)}
          refresh={refresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 4,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 5,
  },
  cardActive: {
    backgroundColor: 'rgba(85,107,47,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(154,186,99,0.3)',
  },
  cardDone: {
    backgroundColor: 'rgba(107,97,64,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(183,173,136,0.28)',
  },
  cardOverdue: {
    borderColor: 'rgba(255,100,100,0.55)',
    borderWidth: 1.5,
  },

  /* Left icon */
  favBtn: { marginRight: 10 },

  /* Content */
  content: { flex: 1 },
  title: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 19,
    color: '#f4f2ed',
    lineHeight: 24,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: 'rgba(244,242,237,0.5)',
  },

  /* Meta rows */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13,
    color: '#c2d5a1',
  },
  overdueText: { color: '#ff9999' },
  notesText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13,
    color: '#b7ad88',
    flex: 1,
  },

  /* Actions */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: { padding: 4 },
});
