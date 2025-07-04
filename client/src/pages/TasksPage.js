import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {useHttp} from "../hooks/http.hook";
import {AuthContext} from "../context/AuthContext";
import {TasksList} from "../components/TasksList";
import {dateToString} from "../methods";
import {CreateTask} from "../components/CreateTask";
import {Habits} from "../components/Habits";
import {todayString, yesterdayString, epicToColor} from "../methods";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid';

export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [creatingTask, setCreatingTask] = useState(false);
    const [taskEdit, setTaskEdit] = useState('');
    const [checkingTask, setCheckingTask] = useState('')
    const {request} = useHttp();
    const {token} = useContext(AuthContext);
    const isFirstRender = useRef(true);

    const today = new Date(), week = new Date(), nextWeek = new Date();
    week.setDate(week.getDate() + 7);
    nextWeek.setDate(nextWeek.getDate() + 14);


    const fetchTasks = useCallback( async () => {
        try{
            const fetched = await request('/api/task', 'GET', null, { Authorization: `Bearer ${token}`});
            setTasks(fetched);
        } catch (e) {}
    }, [token, request]);

    useEffect(() => { if (!creatingTask && taskEdit === '' && checkingTask === '') fetchTasks() }, [fetchTasks, creatingTask, taskEdit, checkingTask]);

    function eventsToCalendar(events) {
        var calendar = [];
        events.map(event => {
            console.log(event);
            calendar.push({ title: event.title, start: event.dateStart, end: event.dateEnd, backgroundColor: epicToColor[event.epic]+"1)", textColor: "#212121"});
        });
        console.log(calendar);
        return calendar
    }

    return (
        <div id="tasksDashBoard">
            <div id="block1">
                <h2>Сегодня</h2>
                {creatingTask
                    ? <CreateTask state={setCreatingTask}/>
                    : <button className="btn-flat" id="createTask" onClick={e => {setCreatingTask(true)}}>
                        <i className="large material-icons">add</i>Новая задача</button>}
                <TasksList editState={[taskEdit, setTaskEdit]}
                           checkingState={[checkingTask, setCheckingTask]}
                           tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) <= dateToString(today))}
                           doneTasks={tasks.filter(task => task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) <= dateToString(today))}
                />
                <h2>Неделя</h2>
                <TasksList editState={[taskEdit, setTaskEdit]}
                           checkingState={[checkingTask, setCheckingTask]}
                           tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(today) && dateToString(task.dateEnd) <= dateToString(week))}
                           doneTasks={tasks.filter(task => task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(today) && dateToString(task.dateEnd) <= dateToString(week))}
                />
                <h2>Следующая неделя</h2>
                <TasksList editState={[taskEdit, setTaskEdit]}
                           checkingState={[checkingTask, setCheckingTask]}
                           tasks={tasks.filter(task => !task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(week) && dateToString(task.dateEnd) <= dateToString(nextWeek))}
                           doneTasks={tasks.filter(task => task.status && task.epic!== 'Привычки' && dateToString(task.dateEnd) > dateToString(week) && dateToString(task.dateEnd) <= dateToString(nextWeek))}
                />
            </div>
            <div id="block2">
                <h2>Привычки</h2>
                <Habits editState={[taskEdit, setTaskEdit]}
                        checkingState={[checkingTask, setCheckingTask]}
                        todayTask={tasks.filter(task => task.epic === 'Привычки' && task.title === ('Привычки_' + todayString))["0"]}
                        yesterdayTask={tasks.filter(task => task.epic === 'Привычки' && task.title === ('Привычки_' + yesterdayString))["0"]}
                        templateTask={tasks.filter(task => task.epic === 'Привычки' && task.title === 'Привычки_шаблон')["0"]}
                />
                <h2>Мероприятия</h2>
                <FullCalendar plugins={[ timeGridPlugin ]}
                              initialView="fourDay"
                              locale="rulocale"
                              slotMinTime="09:00:00"
                              slotMaxTime="22:30:00"
                              slotLabelFormat={{
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false  // 24-часовой формат
                              }}
                              dayHeaderFormat={{ weekday: 'long', month: '2-digit', day: '2-digit'}}
                              views={{
                                  fourDay: {
                                      type: 'timeGrid',
                                      duration: { days: 4 },
                                      buttonText: '4 days'
                                  }
                              }}
                              eventContent={(arg) => (
                                  <div className="custom-event">
                                      <input type="checkbox"></input>
                                      <b>{arg.event.title}</b>
                                  </div>
                              )}
                              events={eventsToCalendar(tasks.filter(task => task.isEvent))}/>
            </div>
        </div>
    )
}