import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Todo } from '../todo';

interface EditTodoModalProps {
  todo: Todo;
  visible: boolean;
  onClose: () => void;
  refresh: () => void;
}

export default function EditTodoModal({ todo, visible, onClose, refresh }: EditTodoModalProps) {
  const db = useSQLiteContext();

  const [title,      setTitle]      = useState(todo.title);
  const [notes,      setNotes]      = useState(todo.notes || '');
  const [dueDate,    setDueDate]    = useState<Date | null>(todo.due_date ? new Date(todo.due_date) : null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  /* ── Save changes ── */
  const saveTodo = async () => {
    if (!title.trim()) {
      Alert.alert('Please enter a todo title.');
      return;
    }
    try {
      await db.runAsync(
        'UPDATE todos SET title = ?, due_date = ?, notes = ? WHERE id = ?;',
        [title.trim(), dueDate ? dueDate.toISOString() : null, notes.trim() || null, todo.id]
      );
      refresh();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  /* ── Picker handlers ── */
  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selected) {
      setDueDate(selected);
    }
  };

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const formatOnlyDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const formatOnlyTime = (d: Date) =>
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        <BlurView intensity={25} tint="dark" style={styles.modalContainer} experimentalBlurMethod="dimezisBlurView">
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Todo</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={26} color="#f4f2ed" />
            </TouchableOpacity>
          </View>

          {/* Title input */}
          <BlurView intensity={20} tint="default" style={styles.inputBox} experimentalBlurMethod="dimezisBlurView">
            <MaterialIcons name="edit" size={18} color="rgba(244,242,237,0.6)" />
            <TextInput
              style={styles.input}
              placeholder="Todo title..."
              placeholderTextColor="rgba(244,242,237,0.45)"
              value={title}
              onChangeText={setTitle}
            />
          </BlurView>

          {/* Date & Time row */}
          <View style={styles.row}>
            <TouchableOpacity activeOpacity={0.75} onPress={() => openPicker('date')} style={{ flex: 1 }}>
              <BlurView intensity={20} tint="default" style={styles.dateBox} experimentalBlurMethod="dimezisBlurView">
                <MaterialIcons name="calendar-today" size={17} color="#9aba63" />
                <Text style={styles.dateLabel}>{dueDate ? formatOnlyDate(dueDate) : 'Date'}</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.75} onPress={() => openPicker('time')} style={{ flex: 1 }}>
              <BlurView intensity={20} tint="default" style={styles.dateBox} experimentalBlurMethod="dimezisBlurView">
                <MaterialIcons name="schedule" size={17} color="#9aba63" />
                <Text style={styles.dateLabel}>{dueDate ? formatOnlyTime(dueDate) : 'Time'}</Text>
              </BlurView>
            </TouchableOpacity>

            {dueDate && (
              <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearDateBtn}>
                <MaterialIcons name="close" size={20} color="rgba(255,160,160,0.8)" />
              </TouchableOpacity>
            )}
          </View>

          {/* Notes input */}
          <BlurView intensity={20} tint="default" style={[styles.inputBox, styles.notesBox]} experimentalBlurMethod="dimezisBlurView">
            <MaterialIcons name="notes" size={17} color="rgba(244,242,237,0.6)" style={{ marginTop: 2 }} />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add notes (optional)…"
              placeholderTextColor="rgba(244,242,237,0.45)"
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </BlurView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={saveTodo}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>

          {/* iOS Modal Picker */}
          {Platform.OS === 'ios' && showPicker && (
            <Modal transparent animationType="slide">
              <View style={styles.iosPickerBg}>
                <View style={styles.iosPickerContainer}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={() => setShowPicker(false)}>
                      <Text style={styles.iosPickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={dueDate ?? new Date()}
                    mode={pickerMode}
                    display="spinner"
                    themeVariant="dark"
                    textColor="#fff"
                    onChange={onPickerChange}
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* Android Picker */}
          {Platform.OS === 'android' && showPicker && (
            <DateTimePicker
              value={dueDate ?? new Date()}
              mode={pickerMode}
              display="spinner"
              onChange={onPickerChange}
            />
          )}

        </BlurView>
      </View>
    </Modal>
  );
}

const GLASS_BG     = 'rgba(244,242,237,0.11)';
const GLASS_BORDER = 'rgba(255,255,255,0.18)';

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(30, 40, 20, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'PlaywriteDELAGuides_400Regular',
    fontSize: 20,
    color: '#f4f2ed',
  },
  
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: GLASS_BORDER,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
    minHeight: 50,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 18,
    color: '#f4f2ed',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: GLASS_BORDER,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 8,
    overflow: 'hidden',
  },
  dateLabel: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 16,
    color: 'rgba(244,242,237,0.85)',
  },
  clearDateBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(255,160,160,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,160,160,0.3)',
  },

  notesBox: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  notesInput: {
    minHeight: 80,
    fontSize: 16,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 18,
    color: 'rgba(244,242,237,0.7)',
  },
  saveBtn: {
    backgroundColor: '#9aba63',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  saveBtnText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 18,
    color: '#313e1b',
    fontWeight: 'bold',
  },
  
  /* iOS Picker Modal */
  iosPickerBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosPickerContainer: {
    backgroundColor: '#2a2a2a',
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#444',
  },
  iosPickerDone: {
    color: '#9aba63',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
