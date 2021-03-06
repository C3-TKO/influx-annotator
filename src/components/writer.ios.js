import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Text,
    TextInput,
    ScrollView,
    Picker,
    AlertIOS,
    TouchableInput
} from 'react-native';
import DatabasePicker from './databasePicker'
import {
    InputDatePicker,
    InputPicker,
    InputGroup,
    InputAddRow,
    SectionHeader,
    Base,
    ButtonGroup,
    Button,
    TouchableRow
} from 'panza'

import RemovableInput from './panza-migrations/removableInput';
import InputRow from './panza-migrations/inputRow';
import InputToggle from './panza-migrations/inputToggle';
import { DEFAULT_LOCALE, DATE_TIME_LOCAL_OPTIONS } from '../constants/dateTimeLocalizationOptions'

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
            tags: this.props.tags,
            date: this.props.date,
            useNow: this.props.useNow,
            focusDate: this.props.focusDate,
            focusPicker: this.props.focusPicker
        };
    }

    onPressButton = async() => {
        const database = this.props.databases.credentials[this.props.databases.selected];
        let body = database.measurement + ' title="' + this.state.title + '",text="' + this.state.text + '"';
        if (this.state.tags.length > 0) {
            body += ',tags="' + this.state.tags.reduce((a, b) => a + ' ' + b) + '"';
        }
        if (!this.state.useNow) {
            body +=  ' ' + (this.state.date.getTime() * 1000000);
        }

        let url = 'https://';

        if (database.username && database.password) {
            url += database.username + ':' + database.password + '@';
        }

        url +=  database.url + ':' + database.port;

        try {
            const response = await fetch(
                url + '/write?db=' + database.name,
                {
                    method: 'POST',
                    body: body
                }
            );

            if (response.status !== 204) {
                AlertIOS.alert(
                    'Annotation was not written to ' + database.alias
                );
            }
        }
        catch(error) {
            AlertIOS.alert(
                error.message
            );
        }
    };

    onRemoveTag = (indexOfRemovedTag) => {
        this.setState({tags: this.state.tags.filter((tag, index) => index != indexOfRemovedTag)})
    }

    onChangeTag = (changedTag, indexOfChangedTag) => {
        this.setState({tags: this.state.tags.map((tag, index) => index === indexOfChangedTag ? changedTag : tag)});
    }

    noop = () => {}

    render() {
        return (
            <ScrollView style={{backgroundColor: '#fafafa'}}>
                <SectionHeader>
                    ANNOTATION WRITER
                </SectionHeader>
                <InputGroup>
                    <DatabasePicker/>
                    <InputRow
                        style={{backgroundColor: '#ffffff'}}
                        label='Title'
                        value={this.state.title}
                        placeholder='Annotation title'
                        onChangeText={(title) => this.setState({ title })}
                    />

                    <TextInput
                        style={{height: 120, borderColor: 'gray', fontSize: 17, paddingLeft: 16, paddingRight: 16, backgroundColor: '#ffffff'}}
                        placeholder="Type here to write the text of the annotation"
                        onChangeText={(text) => this.setState({text})}
                        multiline={true}
                    />
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
                        value={new Date(this.state.date).toLocaleDateString(DEFAULT_LOCALE, DATE_TIME_LOCAL_OPTIONS)}
                        date={this.state.date}
                        expanded={this.state.focusDate}
                        onToggleExpansion={() => {
                        this.setState({ focusDate: !this.state.focusDate })
                    }}
                    />
                </InputGroup>

                <SectionHeader>TAGS (OPTIONAL)</SectionHeader>
                <InputGroup>
                    <InputAddRow
                        label='Add a tag'
                        onPress={() => this.setState({ tags: ['New-tag', ...this.state.tags]})}
                    />
                    {this.state.tags.map((tag, index) =>
                        <RemovableInput
                            key={index}
                            removable
                            onRequestRemove={() => this.onRemoveTag(index)}
                            onSelectLabel={this.noop}
                            onPress={this.noop}
                            onChangeText={(text) => this.onChangeTag(text, index)}
                            value={tag}
                        />
                    )}
                </InputGroup>

                <Base mt={2} p={2}>
                    <ButtonGroup mt={2} vertical>
                        <Button mb={1}
                            primary
                            onPress={this.onPressButton}
                        >
                            Annotate
                        </Button>
                    </ButtonGroup>
                </Base>
            </ScrollView>
        );
    }
}

export default connect(
    state => ({
        databases: state.databases
    })
)(WriterView);