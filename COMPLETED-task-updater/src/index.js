const React = require('react')
const ReactDOM = require('react-dom')
import 'typeface-roboto'
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import { withStyles } from 'material-ui/styles';
const axios = require('axios')
import { createMuiTheme } from 'material-ui/styles';
import purple from 'material-ui/colors/purple';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Snackbar from 'material-ui/Snackbar';
import Slide from 'material-ui/transitions/Slide';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';

// This is how the Material UI package handled styling.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#abf0ff',
      main: '#78bdd6',
      dark: '#458da5',
      contrastText: '#000',
    },
    secondary: {
      light: '#fff',
      main: '#eae3d0',
      dark: '#b8b19f',
      contrastText: '#000',
    },
  },
});

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  inputLabelFocused: {
//    color: purple,
  },
  inputUnderline: {
    '&:after': {
//      backgroundColor: purple,
    },
  },
  textFieldRoot: {
    padding: 0,
    'label + &': {
      marginTop: theme.spacing.unit * 3,
    },
  },
  textFieldInput: {
    borderRadius: 4,
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 12px',
    width: 'calc(100% - 24px)',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
  textFieldFormLabel: {
    fontSize: 18,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  button: {
    margin: theme.spacing.unit,
  },
  close: {
    width: theme.spacing.unit * 4,
    height: theme.spacing.unit * 4,
  },
});

class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeSheetEntries: [],
      formattedData: [],
      fetchFailed: false,
      snackbarOpen: true,
      reloadMessage: "Loading Data..."
    }
  }
  componentDidMount() {
    // Load entries
    // EXERCISE: move refreshAllTaskData here, after earlier button press implementation.
   this.refreshAllTaskData();
  }
  handleSubmit(event) {
    // Add loading bar because JS is asynchronous
    var formattedData = this.state.formattedData;
    formattedData['title'] = event.target.value;
    this.setState({ formattedData: formattedData });
    this.setState({snackbarOpen: true});
  }
  refreshAllTaskData() {
    this.handleOpen();
    var queryTime = Date.now();
    var url = 'http://dev-1.academyvm.test/drupal/web/jsonapi/node/task?time=' + queryTime;
    axios.get(url)
      .then(result => {
        this.setAllTaskData(result, queryTime);
        console.log('success:', result)
      })
      .then(result => {
        this.handleClose();
      })
      .catch(error => this.setState({fetchFailed: true}));
  }
  setAllTaskData(data, queryTime) {

    var formattedData = {};
    // Note for students: Typically the 'map' function is preferred to
    // foreach loops in JS when dealing with performing the same operation
    // on every element in an array.

    // Acts on every element within the array data.data.data
    // I used console.log(data) to find the data I was looking for
    // - it turned out it was located at data.data.data..
    data.data.data.map((i,v) => {
      formattedData[i.attributes.uuid] = {
        body: i.attributes.body.value,
        estimated_time: i.attributes.field_hours,
        hours: i.attributes.field_time_spent,
        task_id: i.attributes.nid,
        uuid: i.attributes.uuid,
        title: i.attributes.title,
        index: v,
        queryTime: queryTime
      }
    });

    this.setState({
      formattedData: formattedData
    });
  }

  // Implement this for homework!
  createNewTask(data) {
  }

  saveAllTaskData() {
    for (var uuid in this.state.formattedData) {
       if (this.state.formattedData.hasOwnProperty(uuid)) {
         this.saveTaskData(uuid);
       }
    }
  }
  saveTaskData(uuid) {
    var data = {};
    data = this.state.formattedData[uuid];
    if (!data.task_id) {
      return this.createNewTask(data);
    }
    var url = 'http://dev-1.academyvm.test/drupal/web/jsonapi/node/task/' + data.uuid;
    var preparedData = {
      data: {
        id: data.uuid,
        type: 'node--task',
        attributes: {
          title: data.title
        }
      }
    };
    axios.patch(url, preparedData,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-type': 'application/vnd.api+json'
        },
      })
      .then(function(response){
        console.log('saved successfully', response)
      });
  }

  handleChange(event) {
    var formattedData = this.state.formattedData;
    formattedData[event.target.id]["title"] = event.target.value;
    this.setState(
      {
        formattedData: formattedData
      }
    );
  }

  handleOpen() {
    this.setState({
      snackbarOpen: true,
      reloadMessage: "Reloading data..."
    });
  }
  handleClose() {
    var _this = this;
    setTimeout(function(){
      _this.setState({
        reloadMessage: "All Done!"
      });
    }, 1000);

    // Show the message for at least 3 seconds before closing
    setTimeout(function(){
      _this.setState({
        snackbarOpen: false
      });
    }, 3000);

  }

  render() {
    var classes = this.props.styles;

    var timeSheetComponents = [];
    for (var item in this.state.formattedData) {
       if (this.state.formattedData.hasOwnProperty(item)) {
         var v = this.state.formattedData[item];
         timeSheetComponents.push(
           <TimeSheetRow taskId={v.task_id} taskTitle={v.title} taskUUID={v.uuid} key={item + v.queryTime} submitHandler={this.saveTaskData.bind(this)} changeHandler={this.handleChange.bind(this)} styles={ this.props.styles } />
         );
       }
    }
    return <div>
        { timeSheetComponents }
        <Grid container spacing={16}>
          <Grid item xs={4}>
            <Button className={classes.button} variant="raised" color="primary" onClick={ this.saveAllTaskData.bind(this) } >
            Save ALL Items</Button>
          </Grid>
          <Grid item xs={4}>
            <Button className={classes.button} variant="raised" color="primary" onClick={ this.refreshAllTaskData.bind(this) }>
            Reload Data</Button>
          </Grid>
        </Grid>
        <Snackbar
          open={this.state.snackbarOpen}
          onClose={this.handleClose.bind(this)}
          transition={Slide}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.reloadMessage}</span>}
          action={
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                className={classes.close}
                onClick={this.handleClose.bind(this)}
              >
                <CloseIcon />
              </IconButton>
            }
          />
      </div>
  }
}

class TimeSheetRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.taskId,
      taskTitle: this.props.taskTitle,
      fetchFailed: this.props.fetchFailed
    }
  }

  resetError() {
    this.setState({fetchFailed: false});
  }

  render() {
    var classes = this.props.styles;
    if (this.state.fetchFailed) {
      return <div>
        Error: Check back later.
        <Button className={classes.button} variant="raised" color="primary" onClick={ this.resetError.bind(this) }>
        Or now..</Button>
      </div>
    }

    var _this = this;
    return <Grid container spacing={8}>
      <Grid item xs={2} md={1}>
        <FormControl fullWidth>
          <InputLabel
              FormLabelClasses={{
                focused: classes.inputLabelFocused,
              }}
              htmlFor={'id-input-' + this.state.id}
            >
              Task ID
            </InputLabel>
            <Input
            disabled
              classes={{
                underline: classes.inputUnderline,
              }}
              id={'id-input-' + this.state.id} value={this.state.id} />
        </FormControl>
      </Grid>
      <Grid item xs>
        <FormControl fullWidth>
          <InputLabel FormLabelClasses={{ focused: classes.inputLabelFocused, }}
            htmlFor={this.props.taskUUID}
            >
            Description
          </InputLabel>
          <Input classes={{ underline: classes.inputUnderline, }}
            multiline placeholder="Say what you did."
            rowsMax={5} id={this.props.taskUUID}
            onChange={this.props.changeHandler}
            defaultValue={ this.state.taskTitle }
            data-uuid={this.props.taskUUID}
          />
        </FormControl>
      </Grid>
      <Grid item xs={3} md={1}>
        <div>
        <Button className={classes.button} variant="raised" color="primary" onClick={ function(){ return _this.props.submitHandler(_this.props.taskUUID); } }>
            Save Item
        </Button>
        </div>
      </Grid>
    </Grid>
  }
}

ReactDOM.render(<TimeSheet styles={ styles }/>, document.getElementById("react-timesheet"));


/*
use this to override drupal form elements??
<input
  accept="image/*"
  className={classes.input}
  id="raised-button-file"
  multiple
  type="file"
/>
/////??????      <label htmlFor="raised-button-file">
  <Button variant="raised" component="span" className={classes.button}>
    Uploadh
  </Button>
</label>

*/
