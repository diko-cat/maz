"use client";

import {
  Avatar, Box, Button, Chip, Divider, IconButton, InputAdornment, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, ThemeProvider, Tooltip, Typography, createTheme,
} from "@mui/material";
import {
  ArrowRight, CalendarDays, CalendarPlus, Check, Clock3, FileHeart,
  Pencil, Plus, Search, Stethoscope, Trash2, Users, X,
} from "lucide-react";
import type { Appointment, DashboardModel, Patient } from "@/lib/types";
import { formatDate, initials, statusLabels } from "@/lib/format";

const theme = createTheme({
  palette: {
    primary: { main: "#4f46e5", light: "#eef2ff", dark: "#3730a3" },
    secondary: { main: "#0891b2" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
    text: { primary: "#18233b", secondary: "#68748a" },
    divider: "#e8ebf2",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Segoe UI", Arial, sans-serif',
    h5: { fontWeight: 700, letterSpacing: "-0.7px" },
    h6: { fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.25px" },
    button: { textTransform: "none", fontWeight: 600 },
    body2: { fontSize: "0.84rem" },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 8, minHeight: 38 } } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#edf0f6", padding: "16px 20px", fontSize: "0.84rem" },
        head: { background: "#fafbfe", color: "#68748a", fontSize: "0.73rem", fontWeight: 600, whiteSpace: "nowrap" },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, fontSize: "0.72rem", height: 26, borderRadius: 6 } } },
  },
});

const cardStyle = { border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" } as const;
const statIcons = { patients: Users, doctors: Stethoscope, appointments: CalendarDays, today: Clock3 };
const statColors = {
  patients: { color: "#4f46e5", background: "#eef2ff" },
  doctors: { color: "#0891b2", background: "#ecfeff" },
  appointments: { color: "#7c3aed", background: "#f5f3ff" },
  today: { color: "#d97706", background: "#fffbeb" },
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Box sx={{ textAlign: "center", py: 7, px: 3 }}>
      <Box sx={{ width: 48, height: 48, display: "grid", placeItems: "center", mx: "auto", mb: 2, borderRadius: 3, color: "primary.main", bgcolor: "primary.light" }}>
        <FileHeart size={23} aria-hidden="true" />
      </Box>
      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </Box>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between", gap: 2, mb: 3 }}>
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 0.6 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Box>
      {action}
    </Stack>
  );
}

function PatientTable({ patients, model, compact = false }: { patients: Patient[]; model: DashboardModel; compact?: boolean }) {
  if (!patients.length) return <EmptyState title="Пациенты не найдены" description="Измените условия поиска или добавьте первого пациента." />;
  return (
    <TableContainer>
      <Table aria-label="Список пациентов" sx={{ minWidth: compact ? 430 : 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Пациент</TableCell>
            {!compact && <TableCell>Дата рождения</TableCell>}
            {!compact && <TableCell>Пол</TableCell>}
            <TableCell>{compact ? "Регистрация" : "Телефон"}</TableCell>
            <TableCell align="right">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((patient, index) => (
            <TableRow key={patient.id} hover>
              <TableCell>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Avatar sx={{ width: 38, height: 38, fontSize: "0.78rem", fontWeight: 600, bgcolor: index % 2 ? "#e0f2fe" : "#ede9fe", color: index % 2 ? "#0369a1" : "#6d28d9" }}>{initials(patient.name)}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ whiteSpace: "nowrap" , fontWeight: 600}}>{patient.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{patient.email || patient.id}</Typography>
                  </Box>
                </Stack>
              </TableCell>
              {!compact && <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(patient.birthDate)}</TableCell>}
              {!compact && <TableCell>{patient.gender === "female" ? "Женский" : "Мужской"}</TableCell>}
              <TableCell sx={{ whiteSpace: "nowrap" }}>{compact ? formatDate(patient.registeredAt) : patient.phone}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => model.onEditPatient(patient)} aria-label={`Редактировать: ${patient.name}`} sx={{ color: "text.secondary" }}><Pencil size={16} /></IconButton>
                  </Tooltip>
                  {!compact && <Tooltip title="Удалить"><IconButton size="small" color="error" onClick={() => model.onDeletePatient(patient)} aria-label={`Удалить: ${patient.name}`}><Trash2 size={16} /></IconButton></Tooltip>}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function StatusChip({ status }: { status: Appointment["status"] }) {
  const colors = {
    confirmed: { bgcolor: "#eaf8f1", color: "#158158" },
    pending: { bgcolor: "#fff7e8", color: "#b36c0b" },
    completed: { bgcolor: "#eef2ff", color: "#4f46e5" },
    cancelled: { bgcolor: "#f2f3f6", color: "#747d8c" },
  };
  return <Chip label={statusLabels[status]} size="small" sx={colors[status]} />;
}

function AppointmentTable({ appointments, model, compact = false }: { appointments: Appointment[]; model: DashboardModel; compact?: boolean }) {
  if (!appointments.length) return <EmptyState title={compact ? "На сегодня записей нет" : "Записи не найдены"} description={compact ? "Создайте запись, чтобы запланировать следующий приём." : "Попробуйте другой запрос или создайте новую запись."} />;
  return (
    <TableContainer>
      <Table aria-label={compact ? "Приёмы на сегодня" : "Все записи на приём"} sx={{ minWidth: compact ? 610 : 780 }}>
        <TableHead>
          <TableRow>
            <TableCell>{compact ? "Время" : "Дата и время"}</TableCell>
            <TableCell>Пациент</TableCell><TableCell>Врач</TableCell><TableCell>Статус</TableCell>
            {!compact && <TableCell align="right">Действия</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((appointment) => {
            const patient = model.patients.find((item) => item.id === appointment.patientId);
            const doctor = model.doctors.find((item) => item.id === appointment.doctorId);
            const cancellable = appointment.status === "confirmed" || appointment.status === "pending";
            return (
              <TableRow key={appointment.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{appointment.time}</Typography>
                  {!compact && <Typography variant="caption" color="text.secondary">{formatDate(appointment.date)}</Typography>}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}><Typography variant="body2" sx={{ fontWeight: 500 }}>{patient?.name || "Пациент удалён"}</Typography></TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Typography variant="body2">{doctor?.name || "Врач не найден"}</Typography>
                  <Typography variant="caption" color="text.secondary">{doctor?.specialty}</Typography>
                </TableCell>
                <TableCell><StatusChip status={appointment.status} /></TableCell>
                {!compact && <TableCell align="right">{cancellable ? <Tooltip title="Отменить запись"><IconButton size="small" onClick={() => model.onCancelAppointment(appointment)} aria-label={`Отменить запись ${patient?.name || "пациента"} на ${appointment.time}`} sx={{ color: "text.secondary" }}><X size={17} /></IconButton></Tooltip> : <Typography variant="caption" color="text.secondary">—</Typography>}</TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SearchField({ model, placeholder }: { model: DashboardModel; placeholder: string }) {
  return <TextField size="small" value={model.query} onChange={(event) => model.setQuery(event.target.value)} placeholder={placeholder} slotProps={{ htmlInput: { "aria-label": placeholder }, input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }} sx={{ width: { xs: "100%", sm: 340 }, bgcolor: "white" }} />;
}

export default function MuiDashboard({ model }: { model: DashboardModel }) {
  const todayAppointments = model.appointments.filter((appointment) => appointment.date === model.today && appointment.status !== "cancelled").sort((a, b) => a.time.localeCompare(b.time));
  const recentPatients = [...model.patients].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)).slice(0, 4);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ color: "text.primary", "& svg": { flexShrink: 0 } }}>
        {model.section === "overview" && <>
          <Paper sx={{ ...cardStyle, p: { xs: 2.5, md: 3.5 }, mb: 3, bgcolor: "#eef2ff", borderColor: "#e0e7ff", position: "relative" }}>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 3 }}>
              <Box>
                <Chip label="Единое пространство клиники" icon={<Check size={13} />} size="small" sx={{ bgcolor: "white", color: "primary.dark", mb: 2, px: 0.5 }} />
                <Typography variant="h5" component="h2" sx={{ fontSize: { xs: "1.45rem", md: "1.8rem" }, mb: 1 }}>Забота начинается с порядка</Typography>
                <Typography variant="body2" sx={{ maxWidth: 470, color: "#5c6591", lineHeight: 1.7 }}>Пациенты, специалисты и расписание приёмов — всё необходимое для рабочего дня в одном месте.</Typography>
              </Box>
              <Button variant="contained" startIcon={<Plus size={18} />} onClick={model.onAddPatient} sx={{ flexShrink: 0, px: 2.5 }}>Добавить пациента</Button>
            </Stack>
          </Paper>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
            {model.stats.map((stat) => {
              const Icon = statIcons[stat.kind];
              const colors = statColors[stat.kind];
              return <Paper key={stat.kind} sx={{ ...cardStyle, p: { xs: 2, md: 2.5 } }}>
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: colors.background, color: colors.color }}><Icon size={18} /></Box>
                </Stack>
                <Typography sx={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-1.1px", lineHeight: 1.1, mb: 1 }}>{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.detail}</Typography>
              </Paper>;
            })}
          </Box>

          <Paper sx={{ ...cardStyle, mb: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ p: 2.5 , justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1}}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#f0f4ff", color: "primary.main", display: "grid", placeItems: "center" }}><CalendarDays size={20} /></Box>
                <Box><Typography variant="h6" component="h3">Расписание на сегодня</Typography><Typography variant="caption" color="text.secondary">{formatDate(model.today)} · {todayAppointments.length} приёмов</Typography></Box>
              </Stack>
              <Button size="small" endIcon={<ArrowRight size={15} />} onClick={() => model.setSection("appointments")}>Все записи</Button>
            </Stack>
            <AppointmentTable appointments={todayAppointments.slice(0, 5)} model={model} compact />
          </Paper>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1.7fr) minmax(280px, 1fr)" }, gap: 3, alignItems: "start" }}>
            <Paper sx={cardStyle}>
              <Stack direction="row" sx={{ p: 2.5 , justifyContent: "space-between", alignItems: "center", gap: 1}}><Typography variant="h6" component="h3">Новые пациенты</Typography><Button size="small" endIcon={<ArrowRight size={15} />} onClick={() => model.setSection("patients")}>Все пациенты</Button></Stack>
              <PatientTable patients={recentPatients} model={model} compact />
            </Paper>
            <Paper sx={{ ...cardStyle, p: 2.5 }}>
              <Typography variant="h6" component="h3" sx={{ mb: 0.5 }}>Следующий шаг</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Управляйте рабочим днём без лишних переходов.</Typography>
              <Button fullWidth variant="outlined" startIcon={<CalendarPlus size={18} />} onClick={model.onAddAppointment} sx={{ justifyContent: "flex-start", px: 2, mb: 1.5 }}>Записать на приём</Button>
              <Button fullWidth variant="outlined" startIcon={<Stethoscope size={18} />} onClick={() => model.setSection("doctors")} sx={{ justifyContent: "flex-start", px: 2 }}>Найти специалиста</Button>
              <Divider sx={{ my: 2.5 }} />
              <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}><Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#16a34a", mt: "6px", flexShrink: 0 }} /><Typography variant="caption" color="text.secondary">Демонстрационные данные сохраняются в этом браузере.</Typography></Stack>
            </Paper>
          </Box>
        </>}

        {model.section === "patients" && <>
          <SectionHeader title="Пациенты" subtitle="Карточки пациентов и контактная информация" action={<Button variant="contained" startIcon={<Plus size={18} />} onClick={model.onAddPatient}>Добавить пациента</Button>} />
          <Paper sx={cardStyle}>
            <Stack direction={{ xs: "column", md: "row" }} sx={{ p: 2.5 , gap: 1.5}}>
              <SearchField model={model} placeholder="Поиск по имени или телефону" />
              <TextField size="small" select label="Пол" value={model.gender} onChange={(event) => model.setGender(event.target.value)} sx={{ minWidth: 150 }}><MenuItem value="">Все пациенты</MenuItem><MenuItem value="female">Женский</MenuItem><MenuItem value="male">Мужской</MenuItem></TextField>
              <TextField size="small" select label="Сортировка" value={model.sort} onChange={(event) => model.setSort(event.target.value)} sx={{ minWidth: 180 }}><MenuItem value="name">По имени</MenuItem><MenuItem value="registeredAt">По регистрации</MenuItem></TextField>
              {(model.query || model.gender) && <Button onClick={() => { model.setQuery(""); model.setGender(""); }}>Сбросить</Button>}
            </Stack>
            <PatientTable patients={model.filteredPatients} model={model} />
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#fafbfe" }}><Typography variant="caption" color="text.secondary">Показано {model.filteredPatients.length} из {model.patients.length} пациентов</Typography></Box>
          </Paper>
        </>}

        {model.section === "doctors" && <>
          <SectionHeader title="Специалисты клиники" subtitle="Команда врачей и доступность для записи на приём" action={<SearchField model={model} placeholder="Имя или специальность" />} />
          {!model.filteredDoctors.length ? <Paper sx={cardStyle}><EmptyState title="Специалисты не найдены" description="Попробуйте поиск по имени или другой специальности." /></Paper> :
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 2.5 }}>
              {model.filteredDoctors.map((doctor, index) => <Paper key={doctor.id} sx={{ ...cardStyle, p: 3 }}>
                <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}><Avatar sx={{ width: 60, height: 60, fontSize: "1.1rem", fontWeight: 600, bgcolor: index % 2 ? "#e0f2fe" : "#ede9fe", color: index % 2 ? "#0369a1" : "#6d28d9" }}>{initials(doctor.name)}</Avatar><Chip label={doctor.available ? "Ведёт приём" : "Не принимает"} size="small" sx={{ bgcolor: doctor.available ? "#eaf8f1" : "#f2f3f6", color: doctor.available ? "#158158" : "#747d8c" }} /></Stack>
                <Typography variant="h6" component="h3" sx={{ mb: 0.5 }}>{doctor.name}</Typography>
                <Typography variant="body2" color="primary.main" sx={{ mb: 2.5 }}>{doctor.specialty}</Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 1 }}><Typography variant="body2" color="text.secondary">Кабинет {doctor.room}</Typography><Button size="small" variant="outlined" disabled={!doctor.available} onClick={model.onAddAppointment} aria-label={`Записать к врачу: ${doctor.name}`}>Записать</Button></Stack>
              </Paper>)}
            </Box>}
        </>}

        {model.section === "appointments" && <>
          <SectionHeader title="Записи на приём" subtitle="Расписание консультаций и статусы записей" action={<Button variant="contained" startIcon={<CalendarPlus size={18} />} onClick={model.onAddAppointment}>Новая запись</Button>} />
          <Paper sx={cardStyle}>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ p: 2.5 , justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 2}}><SearchField model={model} placeholder="Пациент, врач или дата" /><Chip label={`Всего записей: ${model.appointments.length}`} variant="outlined" sx={{ alignSelf: "center" }} /></Stack>
            <AppointmentTable appointments={model.filteredAppointments} model={model} />
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: "#fafbfe" }}><Typography variant="caption" color="text.secondary">Найдено записей: {model.filteredAppointments.length}</Typography></Box>
          </Paper>
        </>}
      </Box>
    </ThemeProvider>
  );
}
