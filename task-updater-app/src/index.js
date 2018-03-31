const React = require('react')
const ReactDOM = require('react-dom')
import 'typeface-roboto'
import { FormControl } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import { withStyles } from 'material-ui/styles';
const axios = require('axios')
import { createMuiTheme } from 'material-ui/styles';
import purple from 'material-ui/colors/purple';
//import Paper from 'material-ui/Paper';
//import Grid from 'material-ui/Grid';
//import Button from 'material-ui/Button';
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

// This Component is the outer container of our task entry app.
class TimeSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // The row data is stored in this object.
      formattedData: [],
      // A boolean which determines whether to display an error.
      fetchFailed: false,
      // If true, display a small pop up with the "reloadMessage" text.
      snackbarOpen: true,
      reloadMessage: "Loading Data..."
    }
  }

  // Similar to a "hook" in Drupal. Runs after the component mounts.
  componentDidMount() {
    // Load data after the component mounts
   this.refreshAllTaskData();
  }

  // Performs a "GET" request to Drupal for task nodes.
  refreshAllTaskData() {
    // Triggers a status message popup using the "Snackbar" component.
    this.handleOpen();

    // This is a "query buster". Ensures we always GET from
    // a "different" URL so that we don't receive cached responses.
    var queryTime = Date.now();
    var url = 'http://ReactForDrupal.dd:8083/jsonapi/node/task?time=' + queryTime;
    // axios fetches the data for us. If successful, it calls "setAllTaskData"
    // If unsuccessful, it sets the state "fetchFailed" to true.
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

  // Updates the formattedData state with the latest data.
  // State updates using setState trigger component re-renders.
  setAllTaskData(data, queryTime) {
    var formattedData = {};
    // Typically the 'map' function is preferred to
    // foreach loops in JS when dealing with performing the same operation
    // on every element in an array.

    // This code acts on every element within the array data.data.data
    // I used console.log(data) to find the data the API returned
    // - it turned out what I needed was located at data.data.data.
    data.data.data.map((i,v) => {
      // I'm using Drupal's uuid as the 'key/property' name
      // This makes it easy for me to tell what task each element is for.
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

    // Calling setState triggers a re-render of this entity.
    this.setState({
      formattedData: formattedData
    });
  }

  // @Students Implement this!
  // You'll need to:
  //   - Set up an axios.post request
  //   - Place a "create new task" button
  //   - Add a bare "task" entry to the formattedData object
  //   - Be sure to set the task_id attribute to 0 so it does not trigger an update
  //   - That will trigger an auto-refresh, and you'll have your new row!

  createNewTask(data) {
  }

  // Loops through formattedData, calls saveAllTaskData
  // for each uuid key in formattedData.
  saveAllTaskData() {
    for (var uuid in this.state.formattedData) {
       if (this.state.formattedData.hasOwnProperty(uuid)) {
         this.updateTaskData(uuid);
       }
    }
  }


  updateTaskData(uuid) {
    var data = {};
    data = this.state.formattedData[uuid];
    if (!data.task_id) {
      return this.createNewTask(data);
    }
    var url = 'http://ReactForDrupal.dd:8083/jsonapi/node/task/' + data.uuid;
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

  // Updates the appropriate title field whenever a key is pressed
  // A state value is being updated on every key press -
  // That means the component is re-rendering for every key press!
  // Not a mistake. Those operations are relatively cheap thanks
  // to React's VirtualDOM.
  handleChange(event) {
    var formattedData = this.state.formattedData;
    formattedData[event.target.id]["title"] = event.target.value;
    this.setState(
      {
        formattedData: formattedData
      }
    );
  }

  // Show the little "Snackbar" popup at the bottom of the page during reloads.
  handleOpen() {
    this.setState({
      snackbarOpen: true,
      reloadMessage: "Reloading data..."
    });
  }

  // Closes the little "Snackbar" popup at the bottom of the page.
  handleClose() {
    var _this = this;
    setTimeout(function(){
      _this.setState({
        reloadMessage: "All Done!"
      });
    }, 1000);

    // Show the message for at least 3 seconds before closing.
    // I put this so we'd have a chance to read the words! The "GET" operation
    // was too fast to process it initially.
    setTimeout(function(){
      _this.setState({
        snackbarOpen: false
      });
    }, 3000);
  }

  // The return value here is JSX that will be compiled to our component itself.
  render() {
    var classes = this.props.styles;

    var Time = [];
    for (var item in this.state.formattedData) {
       if (this.state.formattedData.hasOwnProperty(item)) {
         var v = this.state.formattedData[item];
         timeSheetComponents.push(
           <TimeSheetRow taskTitle={v.title} taskUUID={v.uuid} key={item + v.queryTime} submitHandler={this.updateTaskData.bind(this)} changeHandler={this.handleChange.bind(this)} styles={ this.props.styles } />
         );
       }
    }
    return <div>
        { timeSheetComponents }
            <Button className={classes.button} variant="raised" color="primary" onClick={ this.saveAllTaskData.bind(this) } >
            Save ALL Items</Button>
            <Button className={classes.button} variant="raised" color="primary" onClick={ this.refreshAllTaskData.bind(this) }>
            Reload Data</Button>
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
        Okay, reset this thing..</Button>
      </div>
    }

    var _this = this;
    return <div>
        <FormControl fullWidth>
          <InputLabel
              FormLabelClasses={{
                focused: classes.inputLabelFocused,
              }}
              htmlFor={'id-input-' + this.state.id}>
              Task ID
          </InputLabel>
          <Input
            disabled
              classes={{
                underline: classes.inputUnderline,
              }}
              id={'id-input-' + this.state.id} value={this.state.id} />
        </FormControl>
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
        <Button className={classes.button} variant="raised" color="primary" onClick={ function(){ return _this.props.submitHandler(_this.props.taskUUID); } }>
            Save Item
        </Button>
      </div>
  }
}

ReactDOM.render(<TimeSheet styles={ styles }/>, document.getElementById("react-timesheet"));
