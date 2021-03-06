import React, { Component } from 'react';
import { connect } from 'react-redux';
import InboxRow from './inbboxRow';
import {
    AlertIOS,
    ScrollView,
    View,
    Text,
    TouchableHighlight,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import { TouchableRow } from 'panza';

class AnnotationsView extends Component {
    static defaultProps = {};

    constructor(props) {
        super(props);
        this.state = {
            annotations: [],
            isRefreshing: false
        };
    }

    componentDidMount() {
        this.loadAnnotations();
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.reloadAnnotations) {
            this.loadAnnotations()
        }
    }

    loadAnnotations = async() => {
        this.setState({isRefreshing: true});
        const database = this.props.databases.credentials[this.props.databases.selected];
        try {

            let url = 'https://';

            if (database.username && database.password) {
                url += database.username + ':' + database.password + '@';
            }

            url +=  database.url + ':' + database.port;

            const response = await fetch(
                url + '/query?db=' + database.name + '&q=SELECT title, text, tags, time FROM ' + database.measurement + ' ORDER BY time DESC LIMIT 50',
                {
                    method: 'GET'
                }
            );
            const json = await response.json();
            this.setState({
                annotations: json.results[0].series[0].values
            });
            this.setState({isRefreshing: false});
        } catch(error) {
            AlertIOS.alert(
                error.message,
                'Database ' + this.props.databases.credentials[this.props.databases.selected].alias + ' is not reachable.'
            );
            this.setState({isRefreshing: false});
        }
    };

    renderFilledInbox() {
        return (
            this.state.annotations.map((annotation, index) => {
                const goToAnnotationViewer = () => Actions.viewer(
                    {
                        annotation: {
                            title: annotation[1],
                            time: annotation[0],
                            text: annotation[2],
                            tags: annotation[3]
                        },
                        reloadAnnotations: this.loadAnnotations
                    }
                );
                return (
                    <InboxRow
                        key={index}
                        onPress={goToAnnotationViewer}
                        title={annotation[1]}
                        time={annotation[0]}
                        text={annotation[2]}
                        tags={annotation[3]}
                        value={'test'}
                    />
                )}
            )
        );
    }

    renderEmptyInbox() {
        const {height} = Dimensions.get('window');
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: height / 2 - 80
                }}
            >
                <Text
                    style={{
                        width: 250,
                        textAlign: 'center',
                        fontSize: 17,
                        color: '#8F8E94'
                    }}
                >There are no annotations to be found yet!</Text>
            </View>
        );
    }

    render() {
        return (
            <ScrollView
                style={{
                    marginTop: 20
                }}
                refreshControl={
                <RefreshControl
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.loadAnnotations}
                    tintColor="#000000"
                    title="Loading..."
                    titleColor="#000000"
                    colors={['#ff0000', '#00ff00', '#0000ff']}
                    progressBackgroundColor="#ffff00"
                />}
            >
                {this.state.annotations.length > 0
                    ? this.renderFilledInbox()
                    : this.renderEmptyInbox()
                }
            </ScrollView>
        )

    }
}

export default connect(
    state => ({
        databases: state.databases
    })
)(AnnotationsView);