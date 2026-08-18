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

interface AddTodoProps {
  refresh: () => void;
  initialDate?: Date;
}

export default function AddTodo({ refresh, initialDate }: AddTodoProps) {
  const db = useSQLiteContext();

  const [title,          setTitle]          = useState('');
  const [notes,          setNotes]          = useState('');
  const [dueDate,        setDueDate]        = useState<Date | null>(initialDate || null);
  const [expanded,       setExpanded]       = useState(false);
  const [showPicker,     setShowPicker]     = useState(false);
  const [pickerMode,     setPickerMode]     = useState<'date' | 'time'>('date');

  /* ── Add todo ── */
  const addTodo = async () => {
    if (!title.trim()) {
      Alert.alert('Please enter a todo title.');
      return;
    }
    try {
      await db.runAsync(
        'INSERT INTO todos (title, completed, due_date, notes) VALUES (?, ?, ?, ?);',
        [title.trim(), 0, dueDate ? dueDate.toISOString() : null, notes.trim() || null]
      );
      setTitle('');
      setNotes('');
      setDueDate(null);
      setExpanded(false);
      refresh();
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

  /* ── Render ── */
  return (
    <View style={styles.wrapper}>
      {/* Main row */}
      <View style={styles.mainRow}>
        {/* Glass input */}
        <BlurView intensity={20} tint="default" style={styles.glassBox} experimentalBlurMethod="dimezisBlurView">
          <MaterialIcons name="edit" size={18} color="rgba(244,242,237,0.6)" />
          <TextInput
            style={styles.input}
            placeholder="Add a new todo..."
            placeholderTextColor="rgba(244,242,237,0.45)"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={addTodo}
            returnKeyType="done"
          />
          {/* Expand toggle */}
          <TouchableOpacity onPress={() => setExpanded(e => !e)}>
            <MaterialIcons
              name={expanded ? 'expand-less' : 'expand-more'}
              size={22}
              color="rgba(244,242,237,0.65)"
            />
          </TouchableOpacity>
        </BlurView>

        {/* Add button */}
        <TouchableOpacity style={styles.addBtn} onPress={addTodo} activeOpacity={0.8}>
          <MaterialIcons name="add" size={28} color="#f4f2ed" />
        </TouchableOpacity>
      </View>

      {/* Expanded: date + notes */}
      {expanded && (
        <View style={styles.expandedArea}>
          {/* Date & Time row */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.75} onPress={() => openPicker('date')}>
              <BlurView intensity={20} tint="default" style={styles.glassRow} experimentalBlurMethod="dimezisBlurView">
                <MaterialIcons name="calendar-today" size={17} color="#9aba63" />
                <Text style={styles.dateLabel}>{dueDate ? formatOnlyDate(dueDate) : 'Date'}</Text>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.75} onPress={() => openPicker('time')}>
              <BlurView intensity={20} tint="default" style={styles.glassRow} experimentalBlurMethod="dimezisBlurView">
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
          <BlurView intensity={20} tint="default" style={[styles.glassBox, styles.notesBox]} experimentalBlurMethod="dimezisBlurView">
            <MaterialIcons name="notes" size={17} color="rgba(244,242,237,0.6)" style={styles.notesIcon} />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Add notes (optional)…"
              placeholderTextColor="rgba(244,242,237,0.45)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </BlurView>
        </View>
      )}

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
    </View>
  );
}

const GLASS_BG     = 'rgba(244,242,237,0.14)';
const GLASS_BORDER = 'rgba(255,255,255,0.28)';

const styles = StyleSheet.create({
  wrapper: {
    width: '95%',
    alignSelf: 'center',
    marginBottom: 6,
  },

  /* Main row */
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* Glass text box */
  glassBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: GLASS_BORDER,
    borderWidth: 1.5,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 50,
    gap: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 18,
    color: '#f4f2ed',
  },

  /* Add button */
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#556b2f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(154,186,99,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },

  /* Expanded area */
  expandedArea: {
    marginTop: 8,
    gap: 8,
  },
  glassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: GLASS_BORDER,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    overflow: 'hidden',
  },
  dateLabel: {
    flex: 1,
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 16,
    color: 'rgba(244,242,237,0.85)',
  },
  clearDateBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,160,160,0.15)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,160,160,0.3)',
  },
  notesBox: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  notesIcon: {
    marginTop: 2,
  },
  notesInput: {
    minHeight: 56,
    textAlignVertical: 'top',
    fontSize: 16,
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