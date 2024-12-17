import PropTypes from 'prop-types';
import { useState } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
// @mui
import {
  Card,
  Stack,
  Checkbox,
  CardHeader,
  FormControlLabel,
} from '@mui/material';
// components
// import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppTasks.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  list: PropTypes.array.isRequired,
  selectedPhase: PropTypes.number,
  handlePhasechange: PropTypes.func,
};

export default function AppTasks({ title, subheader, list, selectedPhase, handlePhasechange, ...other }) {
  const { control } = useForm({
    defaultValues: {
      taskCompleted: [],
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <Controller
        name="taskCompleted"
        control={control}
        render={({ field }) => {
          const onSelected = (task) =>
            field.value.includes(task) ? field.value.filter((value) => value !== task) : [...field.value, task];

          return (
            <>
              {list.map((task) => (
                <TaskItem
                  key={task.id}
                  id={task.id}
                  task={task}
                  checked={field.value.includes(task.id) }
                  onChange={handlePhasechange}
                  selectedPhase={selectedPhase}
                />
              ))}
            </>
          );
        }}
      />
    </Card>
  );
}

// ----------------------------------------------------------------------

TaskItem.propTypes = {
  id: PropTypes.number,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  task: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
  }),
  selectedPhase: PropTypes.number,
};

function TaskItem({ id, task, checked, onChange, selectedPhase }) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
  return (
    <Stack
      direction="row"
      sx={{
        px: 2,
        py: 0.75,
        ...(checked && {
          color: 'text.disabled',
          //  textDecoration: 'line-through',
        }),
      }}
    >
      <FormControlLabel
        control={<Checkbox checked={selectedPhase >= parseInt(id, 10)} onChange={event => onChange(event, parseInt(id, 10))} disabled={checked} />}
        label={task.label}
        sx={{ flexGrow: 1, m: 0 }}
      />

    

      
    </Stack>
  );
}






























