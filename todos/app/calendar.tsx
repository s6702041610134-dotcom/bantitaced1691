import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Todo } from './todo';
import AddTodo from './components/addTodo';
import EditTodoModal from './components/editTodoModal';

/* ── Constants ── */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ── Helpers ── */
const daysInMonth  = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const fmtFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });

/* ── Calendar page ── */
export default function CalendarPage() {
  const db    = useSQLiteContext();
  const today = new Date();

  const [year,         setYear]        = useState(today.getFullYear());
  const [month,        setMonth]       = useState(today.getMonth());
  const [selectedDay,  setSelectedDay] = useState<number>(today.getDate());
  const [todos,        setTodos]       = useState<Todo[]>([]);

  const loadTodos = async () => {
    try {
      const rows = await db.getAllAsync<Todo>(
        'SELECT * FROM todos ORDER BY due_date ASC, id DESC'
      );
      setTodos(rows);
    } catch {
      Alert.alert('Cannot load todos.');
    }
  };

  useEffect(() => { loadTodos(); }, []);

  /* ── Navigation ── */
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  /* ── Data queries ── */
  const todosForDay = (day: number): Todo[] => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return todos.filter(t => t.due_date?.startsWith(prefix));
  };

  const selectedTodos  = todosForDay(selectedDay);
  const unscheduled    = todos.filter(t => !t.due_date);
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  /* ── Calendar grid cells ── */
  const totalDays  = daysInMonth(year, month);
  const firstDay   = firstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + totalDays) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDay + 1;
    return d > 0 && d <= totalDays ? d : null;
  });

  /* ── Inline actions ── */
  const toggleCompleted = async (todo: Todo) => {
    try {
      await db.runAsync('UPDATE todos SET completed = ? WHERE id = ?', [
        todo.completed ? 0 : 1, todo.id,
      ]);
      loadTodos();
    } catch (err: any) { Alert.alert(err.message); }
  };

  const deleteTodo = (todo: Todo) => {
    Alert.alert('Delete Todo', `Delete "${todo.title}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await db.runAsync('DELETE FROM todos WHERE id = ?', [todo.id]);
            loadTodos();
          } catch (err: any) { Alert.alert(err.message); }
        },
      },
    ], { cancelable: true });
  };

  /* ════════════════════════════════════ RENDER ══════════════════════════════════ */
  return (
    <ImageBackground
      source={require('./images/bgforanotherpage.jpeg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ──────── Month header ──────── */}
          <View style={styles.monthHeader}>
            <TouchableOpacity style={styles.navBtn} onPress={prevMonth}>
              <MaterialIcons name="chevron-left" size={30} color="#f4f2ed" />
            </TouchableOpacity>

            <View style={styles.monthInfo}>
              <Text style={styles.monthName}>{MONTHS[month]}</Text>
              <Text style={styles.yearText}>{year}</Text>
            </View>

            <TouchableOpacity style={styles.navBtn} onPress={nextMonth}>
              <MaterialIcons name="chevron-right" size={30} color="#f4f2ed" />
            </TouchableOpacity>
          </View>

          {/* ──────── Calendar card ──────── */}
          <View style={styles.calCard}>
            {/* Day-of-week header */}
            <View style={styles.dayNamesRow}>
              {DAYS.map(d => (
                <View key={d} style={styles.dayNameCell}>
                  <Text style={styles.dayName}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {cells.map((day, idx) => {
                if (day === null) return <View key={idx} style={styles.emptyCell} />;

                const dayTodos   = todosForDay(day);
                const hasActive  = dayTodos.some(t => !t.completed);
                const hasDone    = dayTodos.some(t => !!t.completed);
                const selected   = selectedDay === day;
                const todayCell  = isToday(day);

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      selected  && styles.dayCellSelected,
                      todayCell && styles.dayCellToday,
                    ]}
                    onPress={() => setSelectedDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dayNumber,
                      selected  && styles.dayNumberSelected,
                      todayCell && styles.dayNumberToday,
                    ]}>
                      {day}
                    </Text>

                    {/* Dot indicators */}
                    {(hasActive || hasDone) && (
                      <View style={styles.dotRow}>
                        {hasActive && <View style={[styles.dot, styles.dotGreen]} />}
                        {hasDone   && <View style={[styles.dot, styles.dotKhaki]} />}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ──────── Legend ──────── */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.dotGreen]} />
              <Text style={styles.legendText}>Pending</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.dotKhaki]} />
              <Text style={styles.legendText}>Done</Text>
            </View>
          </View>

          {/* ──────── Selected day detail ──────── */}
          <View style={styles.section}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <MaterialIcons name="event" size={20} color="#9aba63" />
              <Text style={styles.sectionTitle}>
                {selectedDay} {MONTHS[month].slice(0, 3)} {year}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{selectedTodos.length}</Text>
              </View>
            </View>

            <AddTodo
              key={`${year}-${month}-${selectedDay}`}
              refresh={loadTodos}
              initialDate={new Date(year, month, selectedDay, 12, 0, 0)}
            />

            {selectedTodos.length === 0 ? (
              <View style={styles.emptySection}>
                <MaterialIcons name="event-available" size={38} color="rgba(154,186,99,0.45)" />
                <Text style={styles.emptySectionText}>No todos scheduled for this day</Text>
              </View>
            ) : (
              selectedTodos.map(todo => (
                <DetailCard
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleCompleted(todo)}
                  onDelete={() => deleteTodo(todo)}
                  refresh={loadTodos}
                />
              ))
            )}
          </View>

          {/* ──────── Unscheduled todos ──────── */}
          {unscheduled.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="favorite-border" size={20} color="#9aba63" />
                <Text style={styles.sectionTitle}>Unscheduled</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unscheduled.length}</Text>
                </View>
              </View>

              {unscheduled.map(todo => (
                <UnscheduledCard key={todo.id} todo={todo} refresh={loadTodos} onToggle={() => toggleCompleted(todo)} onDelete={() => deleteTodo(todo)} />
              ))}
            </View>
          )}

        </ScrollView>
      </View>
    </ImageBackground>
  );
}

/* ════════════════ UnscheduledCard sub-component ════════════════ */
function UnscheduledCard({ todo, refresh, onToggle, onDelete }: any) {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <View style={[styles.simpleCard, !!todo.completed && styles.simpleCardDone]}>
      <TouchableOpacity onPress={onToggle}>
        <MaterialIcons
          name={todo.completed ? 'favorite' : 'favorite-border'}
          size={23}
          color={todo.completed ? '#9aba63' : '#dfe9ce'}
        />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.simpleTitle, !!todo.completed && styles.textDone]} numberOfLines={2}>
          {todo.title}
        </Text>
        {todo.notes ? <Text style={styles.simpleNotes} numberOfLines={1}>{todo.notes}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => setIsEditing(true)} style={{ padding: 4 }}>
        <MaterialIcons name="edit" size={20} color="rgba(244,242,237,0.7)" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
        <MaterialIcons name="delete-outline" size={21} color="rgba(255,160,160,0.75)" />
      </TouchableOpacity>
      {isEditing && (
        <EditTodoModal todo={todo} visible={isEditing} onClose={() => setIsEditing(false)} refresh={refresh} />
      )}
    </View>
  );
}

/* ════════════════ DetailCard sub-component ════════════════ */
function DetailCard({
  todo,
  onToggle,
  onDelete,
  refresh,
}: {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  refresh: () => void;
}) {
  const isOverdue = !!todo.due_date && !todo.completed && new Date(todo.due_date) < new Date();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={[styles.detailCard, !!todo.completed && styles.detailCardDone, isOverdue && styles.detailCardOverdue]}>
      {/* Time bar */}
      {todo.due_date && (
        <View style={styles.timeBar}>
          <MaterialIcons name="schedule" size={13} color={isOverdue ? '#ff9999' : '#9aba63'} />
          <Text style={[styles.timeText, isOverdue && { color: '#ff9999' }]}>
            {'  '}{fmtTime(todo.due_date)}
            {isOverdue && '  ⚠️ Overdue'}
          </Text>
        </View>
      )}

      {/* Body */}
      <View style={styles.detailBody}>
        {/* Toggle icon */}
        <TouchableOpacity onPress={onToggle} style={{ marginTop: 2 }}>
          <MaterialIcons
            name={todo.completed ? 'favorite' : 'favorite-border'}
            size={27}
            color={todo.completed ? '#9aba63' : '#dfe9ce'}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.detailContent}>
          <Text style={[styles.detailTitle, !!todo.completed && styles.textDone]}>
            {todo.title}
          </Text>

          {todo.due_date && (
            <Text style={styles.detailDate}>📅  {fmtFullDate(todo.due_date)}</Text>
          )}

          {todo.notes && (
            <View style={styles.notesBox}>
              <MaterialIcons name="notes" size={13} color="#b7ad88" />
              <Text style={styles.notesText}> {todo.notes}</Text>
            </View>
          )}

          {/* Status badge */}
          <View style={[
            styles.statusBadge,
            todo.completed ? styles.badgeDone : styles.badgePending,
          ]}>
            <Text style={styles.statusText}>
              {todo.completed ? '✅  Done' : '⏳  Pending'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 12, marginTop: 2 }}>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <MaterialIcons name="edit" size={21} color="rgba(244,242,237,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete}>
            <MaterialIcons name="delete-outline" size={22} color="rgba(255,160,160,0.8)" />
          </TouchableOpacity>
        </View>
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

/* ════════════════ Styles ════════════════ */
const GLASS_BG     = 'rgba(244,242,237,0.11)';
const GLASS_BORDER = 'rgba(255,255,255,0.18)';

const styles = StyleSheet.create({
  bg:      { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(55,50,33,0.62)' },

  /* Month header */
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  navBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(85,107,47,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  monthInfo: { alignItems: 'center' },
  monthName: {
    fontFamily: 'PlaywriteDELAGuides_400Regular',
    fontSize: 22, color: '#f4f2ed',
  },
  yearText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 16, color: '#b7ad88', marginTop: 2,
  },

  /* Calendar card */
  calCard: {
    marginHorizontal: 12,
    backgroundColor: GLASS_BG,
    borderColor: GLASS_BORDER,
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 10,
  },

  /* Day names */
  dayNamesRow: { flexDirection: 'row', paddingVertical: 8 },
  dayNameCell: { flex: 1, alignItems: 'center' },
  dayName: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13, color: '#b7ad88',
  },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.285714%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  emptyCell: { width: '14.285714%', aspectRatio: 1 },
  dayCellSelected: { backgroundColor: '#556b2f' },
  dayCellToday:    { borderWidth: 1.5, borderColor: '#9aba63' },

  dayNumber: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 16, color: '#f4f2ed',
  },
  dayNumberSelected: { fontWeight: 'bold' },
  dayNumberToday:    { color: '#9aba63' },

  /* Dots */
  dotRow:   { flexDirection: 'row', gap: 3, marginTop: 2 },
  dot:      { width: 5, height: 5, borderRadius: 2.5 },
  dotGreen: { backgroundColor: '#9aba63' },
  dotKhaki: { backgroundColor: '#b7ad88' },

  /* Legend */
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13, color: 'rgba(244,242,237,0.65)',
  },

  /* Section */
  section: {
    marginHorizontal: 12,
    marginTop: 16,
    backgroundColor: GLASS_BG,
    borderColor: GLASS_BORDER,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: 'PlaywriteDELAGuides_400Regular',
    fontSize: 15, color: '#f4f2ed',
  },
  badge: {
    backgroundColor: '#556b2f',
    borderRadius: 10,
    paddingHorizontal: 9, paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13, color: '#f4f2ed',
  },

  /* Empty */
  emptySection: {
    alignItems: 'center',
    paddingVertical: 20, gap: 8,
  },
  emptySectionText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 15, color: 'rgba(244,242,237,0.5)',
  },

  /* Detail card */
  detailCard: {
    backgroundColor: 'rgba(85,107,47,0.72)',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(154,186,99,0.25)',
  },
  detailCardDone:    { backgroundColor: 'rgba(107,97,64,0.62)',  borderColor: 'rgba(183,173,136,0.25)' },
  detailCardOverdue: { borderColor: 'rgba(255,100,100,0.5)', borderWidth: 1.5 },

  timeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(49,62,27,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  timeText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13, color: '#9aba63',
  },
  detailBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12, gap: 10,
  },
  detailContent: { flex: 1 },
  detailTitle: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 20, color: '#f4f2ed', marginBottom: 4,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: 'rgba(244,242,237,0.45)',
  },
  detailDate: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13, color: '#c2d5a1', marginBottom: 4,
  },
  notesBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 8, padding: 7, marginBottom: 8,
  },
  notesText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 14, color: '#b7ad88', flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  badgeDone:    { backgroundColor: 'rgba(85,107,47,0.85)' },
  badgePending: { backgroundColor: 'rgba(107,97,64,0.65)' },
  statusText: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 13, color: '#f4f2ed',
  },

  /* Simple card (unscheduled) */
  simpleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(85,107,47,0.62)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 7,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(154,186,99,0.2)',
  },
  simpleCardDone: { backgroundColor: 'rgba(107,97,64,0.52)' },
  simpleTitle: {
    flex: 1,
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 17, color: '#f4f2ed',
  },
  simpleNotes: {
    fontFamily: 'IndieFlower_400Regular',
    fontSize: 12, color: '#b7ad88',
  },
});
