/**
 * Provides required informations for data driven tests.
 */
export interface ITest {
    /**
     * The msg for the test
     */
    msg: string;

    /**
     * The actual value which will get compared to the expected.
     */
    actual: any;

    /**
     * The expected result value of the test.
     */
    expected: any;

    /**
     * Tape test method which is used to compare the actual value
     * against the expected.
     */
    method?: string;
}
