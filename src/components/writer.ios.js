import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Text,
    TextInput,
    ScrollView,
    Picker,
    TouchableInput,
    TouchableHighlight
} from 'react-native';
import DatabasePicker from './databasePicker'
import {
    InputDatePicker,
    InputToggle,
    InputPicker,
    InputGroup,
    InputAddRow,
    SectionHeader
} from 'panza'

import RemovableInput from './panza-migrations/removableInput';

const GreenPlusIcon = () => (
    <Base
        backgroundColor='green'
        mr={2}
        style={styles.iconButton}
    >
        <Icon
            name='md-add'
            size={15}
            color='white'
        />
    </Base>
);

class WriterView extends Component {
    static defaultProps = {
        date: new Date(),
        tag: 'manual',
        useNow: true,
        focusDate: false,
        focusPicker: false,
        tags: []
    };

    constructor(props) {
        super(props);
        this.state = {
            title: undefined,
            text: undefined,
            tag: this.props.tag,
            tags: this.props.tags,
            date: this.props.date,
            useNow: this.props.useNow,
            focusDate: this.props.focusDate,
            focusPicker: this.props.focusPicker
        };
    }

    dateTimeLocalOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    onPressButton = () => {
        const database = this.props.databases.credentials[this.props.databases.selected];
        let body = database.measurement + ',type=' + this.state.tag + ' title="' + this.state.title + '",text="' + this.state.text + '"';
        if (!this.state.useNow) {
            body +=  ' + (this.state.date.getTime() * 1000000)';
        }
        fetch(
            'http://' + database.url + ':' + database.port + '/write?db=' + database.name,
            {
                method: 'POST',
                body: body
            }
        );
    };

    onRemoveTag = (indexOfRemovedTag) => {
        this.setState({tags: this.state.tags.filter((tag, index) => index != indexOfRemovedTag)})
    }

    render() {
        return (
            <ScrollView style={{padding: 10}}>
                <TouchableHighlight onPress={this.onPressButton}>
                    <Text style={{padding: 10, fontSize: 20}}>
                        Annotate!
                    </Text>
                </TouchableHighlight>
                <InputGroup>
                    <InputToggle
                        value={this.state.useNow}
                        onValueChange={(value) => this.setState({useNow: value})}
                        label='Now?'
                    />

                    <InputDatePicker
                        editable={!this.state.useNow}
                        hasFocus={this.state.showDate}
                        label={'Time'}
                        onRequestFocus={() => {
                        this.setState({ showDate: true })
                    }}
                        onRequestClose={() => {
                        this.setState({ showDate: false })
                    }}
                        onDateChange={(date) => {
                        this.setState({ date })
                    }}
                        value={new Date(this.state.date).toLocaleDateString('en-US', this.dateTimeLocalOptions)}
                        date={this.state.date}
                        expanded={this.state.focusDate}
                        onToggleExpansion={() => {
                        this.setState({ focusDate: !this.state.focusDate })
                    }}
                    />

                    <InputPicker
                        expanded={this.state.focusPicker}
                        value={this.state.tag}
                        label='Tag'
                        editable={this.state.editable}
                        onToggleExpansion={() => {
                        this.setState({ focusPicker: !this.state.focusPicker })
                    }}>
                        <Picker
                            prompt='Tag'
                            style={{ width: 300 }}
                            selectedValue={this.state.tag}
                            onValueChange={(tag) => this.setState({tag})}>
                            <Picker.Item
                                key='manual'
                                value='manual'
                                label='manual'
                            />
                            <Picker.Item
                                key='live-deploy'
                                value='live-deploy'
                                label='live-deploy'
                            />
                        </Picker>
                    </InputPicker>

                    <DatabasePicker/>

                </InputGroup>

                <Text style={{padding: 10, fontSize: 20}}>
                    Title
                </Text>

                <TextInput
                    style={{height: 20}}
                    placeholder="Type here to write the title"
                    onChangeText={(title) => this.setState({title})}
                />


                <Text style={{padding: 10, fontSize: 20}}>
                    Message
                </Text>

                <TextInput
                    style={{height: 20}}
                    placeholder="Type here to write the text of the annotation"
                    onChangeText={(text) => this.setState({text})}
                />

                <SectionHeader>TAGS (OPTIONAL)</SectionHeader>
                <InputGroup>
                    {this.state.tags.map((tag, index) =>
                        <RemovableInput
                            key={index}
                            removable
                            onRequestRemove={() => this.onRemoveTag(index)}
                            onSelectLabel={noop}
                            onPress={(index) => alert(tag)}
                            onChangeText={() => {}}
                            value={tag}
                        />
                    )}

                    <InputAddRow
                        label='Add a tag'
                        onPress={() => this.setState({ tags: [...this.state.tags, 'New tag']})}
                    />

                </InputGroup>
            </ScrollView>
        );
    }
}

export default connect(
    state => ({
        databases: state.databases
    })
)(WriterView);